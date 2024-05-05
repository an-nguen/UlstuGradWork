using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface ISearchService
{
    public Task<PageDto<BookDto>> SearchByBookDetailsAsync(SearchRequestDto searchRequest);
    public Task<PageDto<BookTextDto>> SearchByBookTexts(TextSearchRequestDto request);
}