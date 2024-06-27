using System.Linq.Expressions;
using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface IBookService
{
    public Task<PageDto<BookDto>> GetPageAsync(
        PageRequestDto request,
        Expression<Func<Book, bool>>? predicate = null,
        User? user = null
        );

    public Task<BookDto?> GetByIdAsync(Guid bookId, Guid? userId = null);

    public Task<BookDto> AddBookAsync(Stream fileStream, BookMetadataDto bookMetadata, Guid userId);

    public Task<BookDto> UpdateBookDetailsAsync(Guid id, BookDetailsUpdateDto details, Guid userId);

    public Task<FileStream> GetBookFileStreamAsync(Guid id, User user);

    public Task<FileStream?> GetBookCoverImageFileStream(Guid bookId);

    public Task DeleteBookAsync(Guid id, Guid userId);

    //* Tracking feature
    public Task<TicketDto> CreateTicketAsync(Guid userId);

    public Task UpdateTotalTimeAsync(Guid bookId, Guid ticketId, long seconds);

    public Task UpdateLastViewedPageAsync(int page, Guid userId, Guid bookId);
}