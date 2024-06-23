using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface ISearchService
{
    public Task<PageDto<BookDto>> SearchByBookDetailsAsync(SearchRequestDto searchRequest, User? user = null);
    public Task<IEnumerable<FullTextSearchTreeEntryDto>> SearchByBookTextsAsync(TextSearchRequestDto request);
}