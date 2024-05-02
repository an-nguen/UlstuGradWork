namespace BookManager.Application.Persistence.Queries;

public sealed record SearchDocumentQuery(string Pattern) : IStreamRequest<BookText>;

public sealed class SearchDocumentTextHandler(IAppDbContext dbContext)
    : IStreamRequestHandler<SearchDocumentQuery, BookText>
{
    public IAsyncEnumerable<BookText> Handle(SearchDocumentQuery request, CancellationToken cancellationToken)
    {
        return dbContext.BookTexts
            .Where(t => EF.Functions.ToTsVector("english", t.Text).Matches(request.Pattern))
            .AsEnumerable().ToAsyncEnumerable();
    }
}