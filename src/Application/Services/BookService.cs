using System.Linq.Expressions;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using BookManager.Application.Common.Interfaces;
using BookManager.Application.Common.Interfaces.Services;
using BookManager.Application.Indexing;
using BookManager.Domain.Enums;
using BookManager.Domain.Exceptions;
using Docnet.Core;
using Docnet.Core.Models;
using NodaTime;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using UglyToad.PdfPig;
using VersOne.Epub;

namespace BookManager.Application.Services;

public sealed class BookService(
    IAppDbContext dbContext,
    IFileStorage fileStorage,
    IIndexingTaskQueue indexingTaskQueue) : IBookService
{
    private IIndexingTaskQueue IndexingTaskQueue { get; } = indexingTaskQueue;

    public async Task<PageDto<BookDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        Expression<Func<Book, bool>>? predicate = null)
    {
        var normalizedPageNumber = PageDto<BookDto>.GetNormalizedPageNumber(pageNumber);
        var query = dbContext.Books.AsQueryable();
        if (predicate != null)
        {
            query = query.Where(predicate);
        }
        var totalItemCount = await query.CountAsync();
        query = query.OrderBy(b => b.Title)
            .Skip((normalizedPageNumber - 1) * pageSize)
            .Take(pageSize);
        var pageCount = PageDto<BookDto>.CountPage(totalItemCount, pageSize);
        var items = await query.Select(b => b.ToDto()).ToListAsync();
        return PageDto<BookDto>.Builder.Create()
            .SetPageNumber(normalizedPageNumber)
            .SetPageSize(items.Count)
            .SetTotalItemCount(totalItemCount)
            .SetPageCount(pageCount)
            .SetItems(items)
            .Build();
    }

    public async Task<BookDto?> GetByIdAsync(Guid bookId)
    {
        var book = await dbContext.Books.FindAsync([bookId]);
        return book?.ToDto();
    }

    public async Task<BookDto> AddBookAsync(Stream fileStream, BookMetadataDto bookMetadata)
    {
        var id = Guid.NewGuid();
        var filename = $"{id}-{bookMetadata.Filename}";
        var fileInfo = await fileStorage.SaveFileAsync(filename, fileStream);
        var extractedTitle = GetDocumentTitleFromFile(fileInfo.FullName);
        var book = new Book
        {
            Id = id,
            Filepath = fileInfo.FullName,
            FileSize = fileInfo.Length,
            FileType = BookFileType.Pdf,
            Title = string.IsNullOrEmpty(bookMetadata.Title) ? extractedTitle : bookMetadata.Title,
            Thumbnail = GetThumbnailPreview(fileInfo.FullName)
        };
        var entry = dbContext.Books.Add(book);
        await dbContext.SaveChangesAsync();
        var document = entry.Entity;
        await IndexingTaskQueue.QueueAsync(
            new IndexingWorkItem(
                IndexingWorkItemOperationType.Created,
                document.Id,
                document.Filepath,
                document.FileType
            )
        );
        return document.ToDto();
    }

    public async Task<BookDto> UpdateBookDetailsAsync(Guid id, BookDto.Details details)
    {
        var found = await dbContext.Books.FindAsync([id]) ?? throw new EntityNotFoundException();
        found.Description = details.Description;
        found.Title = details.Title;
        found.PublisherName = details.PublisherName;
        found.Isbn = details.Isbn;
        var updatedEntityEntry = dbContext.Books.Update(found);
        await dbContext.SaveChangesAsync();
        return updatedEntityEntry.Entity.ToDto();
    }

    public async Task<FileStream> DownloadBookFileStreamAsync(Guid id, User user)
    {
        var book = await dbContext.Books.FindAsync([id]) ?? throw new EntityNotFoundException();
        await UpdateBookAccessTime(id, user.Id);
        return new FileStream(book.Filepath, FileMode.Open);
    }

    public async Task DeleteBookAsync(Guid id)
    {
        var document = await dbContext.Books.FindAsync([id])
                       ?? throw new EntityNotFoundException();
        dbContext.Books.Remove(document);
        await dbContext.SaveChangesAsync();
        await IndexingTaskQueue.QueueAsync(
            new IndexingWorkItem(
                IndexingWorkItemOperationType.Deleted,
                id,
                "",
                BookFileType.Pdf
            )
        );
    }

    private async Task UpdateBookAccessTime(Guid bookId, Guid userId)
    {
        var found = await dbContext.BookUserStatsSet.FindAsync([bookId, userId]);
        if (found != null)
            found.RecentAccess = SystemClock.Instance.GetCurrentInstant();
        else
            dbContext.BookUserStatsSet.Add(new BookUserStats
            {
                BookId = bookId,
                UserId = userId,
                RecentAccess = SystemClock.Instance.GetCurrentInstant()
            });

        await dbContext.SaveChangesAsync();
    }

    private static string GetDocumentTitleFromFile(string filepath)
    {
        switch (DocumentFileTypeUtils.GetFileType(filepath))
        {
            case BookFileType.Pdf:
                using (var document = PdfDocument.Open(filepath))
                {
                    return string.IsNullOrEmpty(document.Information.Title)
                        ? Path.GetFileNameWithoutExtension(filepath)
                        : document.Information.Title;
                }
            case BookFileType.Epub:
                using (var document = EpubReader.OpenBook(filepath))
                {
                    return string.IsNullOrEmpty(document.Title)
                        ? Path.GetFileNameWithoutExtension(filepath)
                        : document.Title;
                }
            default:
                throw new UnsupportedFileTypeException();
        }
    }

    private static byte[]? GetThumbnailPreview(string filepath)
    {
        switch (DocumentFileTypeUtils.GetFileType(filepath))
        {
            case BookFileType.Pdf:
                using (var docReader = DocLib.Instance.GetDocReader(
                           filepath,
                           new PageDimensions(480, 640))
                      )
                {
                    using var pageReader = docReader.GetPageReader(0);
                    var rawBytes = pageReader.GetImage();
                    var width = pageReader.GetPageWidth();
                    var height = pageReader.GetPageHeight();
                    using var stream = new MemoryStream();
                    if (rawBytes == null) return null;
                    var image = Image.LoadPixelData<Bgra32>(rawBytes, width, height);
                    image.Mutate(x => x.BackgroundColor(Color.White));
                    image.SaveAsJpeg(stream);
                    return stream.ToArray();
                }
            case BookFileType.Epub:
            default:
                return null;
        }
    }
}