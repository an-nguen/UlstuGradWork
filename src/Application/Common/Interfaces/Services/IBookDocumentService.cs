using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface IBookDocumentService
{
    public IAsyncEnumerable<BookDocumentDto> GetAllAsync();

    public Task<BookDocumentDto?> GetByIdAsync(Guid bookDocumentId);

    public Task<BookDocumentDto> AddBookDocumentAsync(Stream fileStream, FileMetadataDto fileMetadata);

    public Task<BookDocumentDto> UpdateBookDocumentDetailsAsync(BookDocumentDto.Details details);

    public Task<BookDocumentDto> ReplaceBookDocumentFileAsync(Guid id, Stream fileStream, FileMetadataDto metadata);

    public IAsyncEnumerable<FileChunkDto> DownloadBookDocumentFile(Guid id);
    
    public Task<FileStream> DownloadBookDocumentFileStreamAsync(Guid id);
    
    public Task DeleteBookDocumentAsync(Guid id);
}