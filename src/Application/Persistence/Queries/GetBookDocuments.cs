namespace BookManager.Application.Persistence.Queries;

public record GetBookDocumentsQuery : IStreamRequest<BookDocument>;

public class GetBookDocumentsHandler(IAppDbContext dbContext)
    : IStreamRequestHandler<GetBookDocumentsQuery, BookDocument>
{
    public IAsyncEnumerable<BookDocument> Handle(GetBookDocumentsQuery request, CancellationToken cancellationToken) 
        => dbContext.BookDocuments.AsAsyncEnumerable();
}