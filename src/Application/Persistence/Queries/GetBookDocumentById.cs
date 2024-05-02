namespace BookManager.Application.Persistence.Queries;

public record GetBookByIdQuery(Guid Id) : IRequest<Book>;

public class GetBookByIdHandler(IAppDbContext dbContext)
    : IRequestHandler<GetBookByIdQuery, Book?>
{
    public async Task<Book?> Handle(GetBookByIdQuery request, CancellationToken cancellationToken)
    {
        return await dbContext.Books.FindAsync([request.Id], cancellationToken);
    }
}