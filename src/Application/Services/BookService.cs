using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using BookManager.Application.Common.Interfaces;
using BookManager.Application.Common.Interfaces.Services;
using BookManager.Application.Indexing;
using BookManager.Application.Persistence.Commands;
using BookManager.Application.Persistence.Queries;
using BookManager.Domain.Enums;
using BookManager.Domain.Exceptions;
using Docnet.Core;
using Docnet.Core.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using UglyToad.PdfPig;
using VersOne.Epub;

namespace BookManager.Application.Services;

public sealed class BookService(
    ISender sender,
    IFileStorage fileStorage,
    IIndexingTaskQueue indexingTaskQueue) : IBookService
{
    private IIndexingTaskQueue IndexingTaskQueue { get; } = indexingTaskQueue;

    public IAsyncEnumerable<BookDto> GetPage(int pageNumber, int pageSize)
    {
        return sender.CreateStream(new GetBooksQuery(pageNumber, pageSize)).Select(b => b.ToDto());
    }

    public async Task<BookDto?> GetByIdAsync(Guid bookId)
    {
        return (await sender.Send(new GetBookByIdQuery(bookId))).ToDto();
    }

    public async Task<BookDto> AddBookAsync(Stream fileStream, BookMetadataDto bookMetadata)
    {
        var id = Guid.NewGuid();
        var filename = $"{id}-{bookMetadata.Filename}";
        var fileInfo = await fileStorage.SaveFileAsync(filename, fileStream);
        var extractedTitle = GetDocumentTitleFromFile(fileInfo.FullName);

        var document = await sender.Send(new AddBookCommand(new Book
        {
            Id = id,
            Filepath = fileInfo.FullName,
            FileSize = fileInfo.Length,
            FileType = BookFileType.Pdf,
            Title = string.IsNullOrEmpty(bookMetadata.Title) ? extractedTitle : bookMetadata.Title,
            Thumbnail = GetThumbnailPreview(fileInfo.FullName)
        }));
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
        var found = await sender.Send(new GetBookByIdQuery(id)) ?? throw new EntityNotFoundException();
        found.Description = details.Description;
        found.Title = details.Title;
        found.PublisherName = details.PublisherName;
        found.Isbn = details.Isbn;
        return (await sender.Send(new UpdateBookCommand(found))).ToDto();
    }

    public async Task<FileStream> DownloadBookFileStreamAsync(Guid id, User user)
    {
        var book = await sender.Send(new GetBookByIdQuery(id));
        await sender.Send(new UpdateBookAccessTimeCommand(id, user.Id));
        return new FileStream(book.Filepath, FileMode.Open);
    }

    public async Task DeleteBookAsync(Guid id)
    {
        await sender.Send(new DeleteBookCommand(id));
        await IndexingTaskQueue.QueueAsync(
            new IndexingWorkItem(
                IndexingWorkItemOperationType.Deleted,
                id,
                "",
                BookFileType.Pdf
            )
        );
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