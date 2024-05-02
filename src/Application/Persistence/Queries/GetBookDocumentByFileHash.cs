namespace BookManager.Application.Persistence.Queries;

public record GetBookDocumentByFileHashQuery(string FileHash) : IRequest<BookDocument?>;

public class GetBookDocumentByFileHashHandler(IAppDbContext dbContext)
    : IRequestHandler<GetBookDocumentByFileHashQuery, BookDocument?>
{
    public async Task<BookDocument?> Handle(GetBookDocumentByFileHashQuery request, CancellationToken cancellationToken)
    {
        return await dbContext.BookDocuments.FirstOrDefaultAsync(d => d.FileHash == request.FileHash,
            cancellationToken);
    }
}