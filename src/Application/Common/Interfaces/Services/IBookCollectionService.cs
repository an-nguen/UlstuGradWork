using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface IBookCollectionService
{
    public Task<IEnumerable<BookCollectionDto>> GetAllAsync();

    public Task<BookCollectionDto> CreateAsync(BookCollectionModRequest request);

    public Task<BookCollectionDto> UpdateAsync(Guid id, BookCollectionModRequest request);

    public Task DeleteAsync(Guid id);
}