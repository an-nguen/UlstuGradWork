using System.Linq.Expressions;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using BookManager.Application.Common.Interfaces;
using BookManager.Application.Common.Interfaces.Services;
using BookManager.Application.Indexing;
using BookManager.Domain.Enums;
using NodaTime;

namespace BookManager.Application.Services;

public sealed class BookService(
    IAppDbContext dbContext,
    IFileStorage fileStorage,
    IEnumerable<IBookFileHandler> bookFileHandlers,
    IIndexingTaskQueue indexingTaskQueue) : IBookService
{
    private IIndexingTaskQueue IndexingTaskQueue { get; } = indexingTaskQueue;

    public async Task<PageDto<BookDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        Expression<Func<Book, bool>>? predicate = null,
        User? user = null)
    {
        var normalizedPageNumber = PageDto<BookDto>.GetNormalizedPageNumber(pageNumber);
        var query = dbContext.Books.AsQueryable();
        if (predicate != null)
        {
            query = query.Where(predicate);
        }

        if (user != null)
        {
            query = query.Include(b => b.Stats.Where(u => u.UserId == user.Id));
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
        var thumbnailImage = await SaveThumbnailImage(fileInfo.FullName, filename);
        var book = new Book
        {
            Id = id,
            Filename = fileInfo.Name,
            FileSize = fileInfo.Length,
            FileType = BookFileType.Pdf,
            Title = !string.IsNullOrEmpty(bookMetadata.Title) ? bookMetadata.Title 
                : string.IsNullOrEmpty(extractedTitle) ? bookMetadata.Filename : extractedTitle,
            ThumbnailFilename = thumbnailImage
        };
        var entry = dbContext.Books.Add(book);
        await dbContext.SaveChangesAsync();
        var document = entry.Entity;
        await IndexingTaskQueue.QueueAsync(
            new IndexingWorkItem(
                IndexingWorkItemOperationType.Created,
                document.Id
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

    public async Task<FileStream> GetBookFileStreamAsync(Guid id, User user)
    {
        var book = await dbContext.Books.FindAsync([id]) ?? throw new EntityNotFoundException();
        await UpdateBookAccessTime(id, user.Id);
        return fileStorage.GetFileStream(book.Filename);
    }

    public async Task<FileStream?> GetBookCoverImageFileStream(Guid bookId)
    {
        var book = await dbContext.Books.FindAsync([bookId]) ?? throw new EntityNotFoundException();
        return book.ThumbnailFilename == null ? null : fileStorage.GetFileStream(book.ThumbnailFilename);
    }

    public async Task DeleteBookAsync(Guid id)
    {
        var document = await dbContext.Books.FindAsync([id])
                       ?? throw new EntityNotFoundException();
        dbContext.Books.Remove(document);
        await dbContext.SaveChangesAsync();
        await IndexingTaskQueue.QueueAsync(new IndexingWorkItem(IndexingWorkItemOperationType.Deleted, id));
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

    private string? GetDocumentTitleFromFile(string bookFilepath)
    {
        var fileType = DocumentFileTypeUtils.GetFileType(bookFilepath);
        var bookFileStream = fileStorage.GetFileStream(bookFilepath);
        foreach (var bookFileHandler in bookFileHandlers)
        {
            if (bookFileHandler.FileType != fileType) continue;
            return bookFileHandler.GetBookTitle(bookFileStream);
        }

        return null;
    }

    private async Task<string?> SaveThumbnailImage(string bookFilepath, string imageFilenameWithoutExt)
    {
        var fileType = DocumentFileTypeUtils.GetFileType(bookFilepath);
        foreach (var bookFileHandler in bookFileHandlers)
        {
            if (bookFileHandler.FileType != fileType) continue;
            var stream = fileStorage.GetFileStream(bookFilepath);
            var rawImage = bookFileHandler.GetPreviewImage(stream);
            if (rawImage == null) return null;
            var imageStream = await bookFileHandler.GetJpegImageAsync(rawImage);
            var fileInfo = await fileStorage.SaveFileAsync($"{imageFilenameWithoutExt}.jpg", imageStream);
            return fileInfo.Name;
        }

        return null;
    }
    
}