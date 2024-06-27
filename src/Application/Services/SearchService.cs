using System.Linq.Expressions;
using System.Reflection;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces.Services;
using LinqKit;

namespace BookManager.Application.Services;

internal record SearchResult(BookTextDto BookText, BookDto BookDto);

internal sealed class SearchService(IAppDbContext dbContext, IBookService bookService) : ISearchService
{
    public async Task<PageDto<BookDto>> SearchByBookDetailsAsync(SearchRequestDto searchRequest, User? user = null)
    {
        var predicate = PredicateBuilder.New<Book>();
        var propertiesInfo = searchRequest.GetType().GetProperties();
        foreach (var propInfo in propertiesInfo)
        {
            if (propInfo.GetValue(searchRequest) is not string stringValue
                || !typeof(Book).GetProperties().Select(p => p.Name).Contains(propInfo.Name))
                continue;
            var expr = GetStringContainsExpression<Book>(propInfo, stringValue);
            predicate = predicate.Or(expr);
        }

        if (searchRequest.Authors is { Length: > 0 })
        {
            predicate = predicate.Or(b => b.Authors!.Intersect(searchRequest.Authors).Any());
        }

        var request = new PageRequestDto(
            searchRequest.PageNumber,
            searchRequest.PageSize,
            searchRequest.SortProperty,
            searchRequest.SortOrder ?? SortOrder.Asc
        );
        return await bookService.GetPageAsync(request, predicate, user);
    }

    public async Task<IEnumerable<FullTextSearchTreeEntryDto>> SearchByBookTextsAsync(TextSearchRequestDto request)
    {
        if (string.IsNullOrEmpty(request.Pattern)) throw new ArgumentException("Invalid pattern", nameof(request));
        return await dbContext.BookTexts
            .Where(t => EF.Functions.ToTsVector("english", t.Text).Matches(request.Pattern))
            .GroupBy(bt => bt.BookDocumentId)
            .Select(grouping => new FullTextSearchTreeEntryDto
            {
                BookId = grouping.Key,
                BookDetails = dbContext.Books
                                       .FirstOrDefault(b => b.Id == grouping.Key)!
                                       .ToDto()
                                       .DocumentDetails,
                Texts = grouping.Select(bt => bt.ToDto())
            })
            .ToListAsync();
    }

    // Original: https://stackoverflow.com/questions/278684/how-do-i-create-an-expression-tree-to-represent-string-containsterm-in-c
    // Also you can read: https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/expression-trees-building
    private static Expression<Func<T, bool>> GetStringContainsExpression<T>(PropertyInfo propertyInfo, string propertyValue)
    {
        var parameterExpr = Expression.Parameter(typeof(T), "anything");
        // https://devblogs.microsoft.com/dotnet/creating-aot-compatible-libraries/
        var propertyExpr = Expression.Property(parameterExpr, propertyInfo.Name);
        var method = typeof(string).GetMethod("Contains", [typeof(string)]);
        var someValue = Expression.Constant(propertyValue, typeof(string));
        var containsMethodExp = Expression.Call(propertyExpr, method!, someValue);

        return Expression.Lambda<Func<T, bool>>(containsMethodExp, parameterExpr);
    }
}