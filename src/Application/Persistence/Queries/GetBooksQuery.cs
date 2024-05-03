namespace BookManager.Application.Persistence.Queries;

public sealed record GetBooksQuery(int PageNumber, int PageSize) : IStreamRequest<Book>;

public sealed class GetBooksHandler(IAppDbContext dbContext)
    : IStreamRequestHandler<GetBooksQuery, Book>
{
    public IAsyncEnumerable<Book> Handle(GetBooksQuery request, CancellationToken cancellationToken)
    {
        return dbContext.Books.OrderBy(b => b.Title)
            .Skip(request.PageNumber * request.PageSize)
            .Take(request.PageSize)
            .AsAsyncEnumerable();
    }
}