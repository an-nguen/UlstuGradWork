using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface IBookService
{
    public IAsyncEnumerable<BookDto> GetPage(int pageNumber, int pageSize);

    public Task<BookDto?> GetByIdAsync(Guid bookId);

    public Task<BookDto> AddBookAsync(Stream fileStream, BookMetadataDto bookMetadata);

    public Task<BookDto> UpdateBookDetailsAsync(Guid id, BookDto.Details details);

    public Task<FileStream> DownloadBookFileStreamAsync(Guid id);
    
    public Task DeleteBookAsync(Guid id);
}