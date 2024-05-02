namespace BookManager.Application.Persistence.Queries;

public sealed record GetUserByIdQuery(Guid Id): IRequest<User?>;

public sealed class GetUserByIdQueryHandler(IAppDbContext dbContext) : IRequestHandler<GetUserByIdQuery, User?>
{
    public async Task<User?> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        return await dbContext.Users.FindAsync([request.Id], cancellationToken);
    }
}
