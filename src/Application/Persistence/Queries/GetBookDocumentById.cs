namespace BookManager.Application.Persistence.Queries;

public record GetBookDocumentByIdQuery(Guid Id) : IRequest<BookDocument>;

public class GetBookDocumentByIdHandler(IAppDbContext dbContext)
    : IRequestHandler<GetBookDocumentByIdQuery, BookDocument?>
{
    public async Task<BookDocument?> Handle(GetBookDocumentByIdQuery request, CancellationToken cancellationToken)
    {
        return await dbContext.BookDocuments.FindAsync([request.Id], cancellationToken);
    }
}