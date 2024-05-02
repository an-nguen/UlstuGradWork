namespace BookManager.Application.Persistence.Queries;

public sealed record SearchDocumentQuery(string Pattern) : IStreamRequest<BookDocumentText>;

public sealed class SearchDocumentTextHandler(IAppDbContext dbContext)
    : IStreamRequestHandler<SearchDocumentQuery, BookDocumentText>
{
    public IAsyncEnumerable<BookDocumentText> Handle(SearchDocumentQuery request, CancellationToken cancellationToken)
    {
        return dbContext.BookDocumentsTexts
            .Where(t => EF.Functions.ToTsVector("english", t.Text).Matches(request.Pattern))
            .AsEnumerable().ToAsyncEnumerable();
    }
}