using System.Linq.Expressions;
using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface IBookService
{
    public Task<PageDto<BookDto>> GetPageAsync(int pageNumber, int pageSize, Expression<Func<Book, bool>>? predicate = null);

    public Task<BookDto?> GetByIdAsync(Guid bookId);

    public Task<BookDto> AddBookAsync(Stream fileStream, BookMetadataDto bookMetadata);

    public Task<BookDto> UpdateBookDetailsAsync(Guid id, BookDto.Details details);

    public Task<FileStream> GetBookFileStreamAsync(Guid id, User user);

    public Task<FileStream?> GetBookCoverImageFileStream(Guid bookId);
    
    public Task DeleteBookAsync(Guid id);
}