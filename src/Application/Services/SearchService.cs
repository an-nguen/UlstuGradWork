using System.Linq.Expressions;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces.Services;
using LinqKit;

namespace BookManager.Application.Services;

public sealed class SearchService(IAppDbContext dbContext, IBookService bookService) : ISearchService
{
    public async Task<PageDto<BookDto>> SearchByBookDetailsAsync(SearchRequestDto searchRequest, User? user = null)
    {
        var predicate = PredicateBuilder.New<Book>();
        foreach (var propInfo in searchRequest.GetType().GetProperties())
        {
            if (propInfo.GetValue(searchRequest) is not string stringValue
                || !typeof(Book).GetProperties().Select(p => p.Name).Contains(propInfo.Name))
                continue;
            var expr = GetStringContainsExpression<Book>(propInfo.Name, stringValue);
            predicate = predicate.Or(expr);
        }

        if (searchRequest.Authors is { Length: > 0 })
        {
            predicate = predicate.Or(b => b.Authors.Intersect(searchRequest.Authors).Any());
        }

        var request = new PageRequestDto(
            searchRequest.PageNumber,
            searchRequest.PageSize,
            searchRequest.SortProperty,
            searchRequest.SortOrder ?? SortOrder.Asc
        );
        return await bookService.GetPageAsync(request, predicate, user);
    }

    public async Task<PageDto<BookTextDto>> SearchByBookTexts(TextSearchRequestDto request)
    {
        if (string.IsNullOrEmpty(request.Pattern)) throw new ArgumentException(request.Pattern);
        var normalizedPageNumber = PageDto<BookTextDto>.GetNormalizedPageNumber(request.PageNumber);
        var query = dbContext.BookTexts
            .Where(t => EF.Functions.ToTsVector("english", t.Text).Matches(request.Pattern))
            .OrderBy(t => t.PageNumber)
            .Skip((normalizedPageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(t => t.ToDto());

        var totalItemCount = await query.CountAsync();
        var pageCount = PageDto<BookTextDto>.CountPage(totalItemCount, request.PageSize);
        var searchResults = await query.ToListAsync();

        return PageDto<BookTextDto>.Builder.Create()
            .SetPageCount(pageCount)
            .SetPageNumber(normalizedPageNumber)
            .SetTotalItemCount(totalItemCount)
            .SetItems(searchResults)
            .Build();
    }

    // Original: https://stackoverflow.com/questions/278684/how-do-i-create-an-expression-tree-to-represent-string-containsterm-in-c
    // Also you can read: https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/expression-trees-building
    private static Expression<Func<T, bool>> GetStringContainsExpression<T>(string propertyName, string propertyValue)
    {
        var parameterExp = Expression.Parameter(typeof(T), "anything");
        var propertyExp = Expression.Property(parameterExp, propertyName);
        var method = typeof(string).GetMethod("Contains", [typeof(string)]);
        var someValue = Expression.Constant(propertyValue, typeof(string));
        var containsMethodExp = Expression.Call(propertyExp, method!, someValue);

        return Expression.Lambda<Func<T, bool>>(containsMethodExp, parameterExp);
    }
}