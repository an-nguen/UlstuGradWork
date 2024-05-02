using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface ISearchService
{
    public IAsyncEnumerable<BookTextDto> TextSearch(string pattern);
}