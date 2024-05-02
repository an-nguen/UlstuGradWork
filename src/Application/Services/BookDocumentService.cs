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
using NodaTime;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using UglyToad.PdfPig;
using VersOne.Epub;

namespace BookManager.Application.Services;

public sealed class BookDocumentService(
    ISender sender,
    IFileStorage fileStorage,
    IIndexingTaskQueue indexingTaskQueue) : IBookDocumentService
{
    private IIndexingTaskQueue IndexingTaskQueue { get; } = indexingTaskQueue;

    public IAsyncEnumerable<BookDocumentDto> GetAllAsync()
    {
        return sender.CreateStream(new GetBookDocumentsQuery()).Select(bookDocument => bookDocument.ToDto());
    }

    public async Task<BookDocumentDto?> GetByIdAsync(Guid bookDocumentId)
    {
        return (await sender.Send(new GetBookDocumentByIdQuery(bookDocumentId))).ToDto();
    }

    public async Task<BookDocumentDto> AddBookDocumentAsync(Stream fileStream, FileMetadataDto fileMetadata)
    {
        var id = Guid.NewGuid();
        var filename = $"{id}-{fileMetadata.Name}";
        var fileInfo = await fileStorage.SaveFileAsync(filename, fileStream);
        var extractedTitle = GetDocumentTitleFromFile(fileInfo.FullName);

        if (!IsHashValid(fileInfo.FullName, fileMetadata.Hash))
        {
            fileStorage.DeleteFile(fileInfo.FullName);
            throw new InvalidFileHashException();
        }

        var document = await sender.Send(new AddBookDocumentCommand(new BookDocument
        {
            Id = id,
            Filepath = fileInfo.FullName,
            FileHash = fileMetadata.Hash,
            FileType = fileMetadata.DocumentFormatType,
            FileSize = fileInfo.Length,
            Title = string.IsNullOrEmpty(extractedTitle) ? filename : extractedTitle,
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

    public async Task<BookDocumentDto> UpdateBookDocumentDetailsAsync(BookDocumentDto.Details details)
    {
        return (await sender.Send(new PartialUpdateBookDocumentCommand
        {
            Id = details.Id,
            Title = string.IsNullOrEmpty(details.Title)
                ? null
                : details.Title,
            Description = details.Description,
            Isbn = details.Isbn,
            PublisherName = details.PublisherName
        })).ToDto();
    }

    public async Task<BookDocumentDto> ReplaceBookDocumentFileAsync(Guid id, Stream fileStream,
        FileMetadataDto fileMetadata)
    {
        if (await IsFileExistsByHash(fileMetadata.Hash))
            throw new FileAlreadyExistsException();

        var found = await sender.Send(new GetBookDocumentByIdQuery(id)) ?? throw new EntityNotFoundException();
        fileStorage.DeleteFile(found.Filepath);
        var filename = $"{found.Id}-{fileMetadata.Name}";
        var filepath = (await fileStorage.SaveFileAsync(filename, fileStream)).FullName;
        if (!IsHashValid(filepath, fileMetadata.Hash))
        {
            fileStorage.DeleteFile(filepath);
            throw new InvalidFileHashException();
        }

        var document = await sender.Send(new PartialUpdateBookDocumentCommand
        {
            Id = id,
            Filepath = filepath,
            HashId = string.IsNullOrEmpty(filepath)
                ? fileStorage.GetFileHash(filepath)
                : null,
            FileHash = fileMetadata.Hash,
            DocumentFileType = fileMetadata.DocumentFormatType,
            Thumbnail = GetThumbnailPreview(filepath)
        });
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

    public async IAsyncEnumerable<FileChunkDto> DownloadBookDocumentFile(Guid id)
    {
        var bookDocument = await sender.Send(new GetBookDocumentByIdQuery(id));
        await sender.Send(new PartialUpdateBookDocumentCommand
        {
            Id = id,
            RecentAccess = SystemClock.Instance.GetCurrentInstant()
        });
        await foreach (var chunk in fileStorage.ReadFileAsync(bookDocument.Filepath))
            yield return new FileChunkDto
            {
                Hash = bookDocument.FileHash,
                Data = chunk
            };
    }

    public async Task<FileStream> DownloadBookDocumentFileStreamAsync(Guid id)
    {
        var bookDocument = await sender.Send(new GetBookDocumentByIdQuery(id));
        return new FileStream(bookDocument.Filepath, FileMode.Open);
    }

    public async Task DeleteBookDocumentAsync(Guid id)
    {
        await sender.Send(new DeleteBookDocumentCommand(id));
        await IndexingTaskQueue.QueueAsync(
            new IndexingWorkItem(
                IndexingWorkItemOperationType.Deleted,
                id,
                "",
                DocumentFileType.Pdf
            )
        );
    }

    private async Task<bool> IsFileExistsByHash(string hash)
    {
        var bookDocument = await sender.Send(new GetBookDocumentByFileHashQuery(hash));
        return bookDocument != null;
    }

    private bool IsHashValid(string filepath, string hash)
    {
        return fileStorage.GetFileHash(filepath) == hash;
    }

    private static string GetDocumentTitleFromFile(string filepath)
    {
        switch (DocumentFileTypeUtils.GetFileType(filepath))
        {
            case DocumentFileType.Pdf:
                using (var document = PdfDocument.Open(filepath))
                {
                    return string.IsNullOrEmpty(document.Information.Title)
                        ? Path.GetFileNameWithoutExtension(filepath)
                        : document.Information.Title;
                }
            case DocumentFileType.Epub:
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
            case DocumentFileType.Pdf:
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
            case DocumentFileType.Epub:
            default:
                return null;
        }
    }
}