using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces.Services;
using BookManager.Application.Persistence.Queries;

namespace BookManager.Application.Services;

public sealed class SearchService(ISender sender) : ISearchService
{
    public IAsyncEnumerable<BookTextDto> TextSearch(string pattern) =>
        sender.CreateStream(new SearchDocumentQuery(pattern))
            .Select(searchResult => searchResult.ToDto());
}