namespace BookManager.Application.Persistence.Queries;

public sealed record GetUsersQuery: IStreamRequest<User>;

public sealed class GetUsersHandler(IAppDbContext dbContext) : IStreamRequestHandler<GetUsersQuery, User>
{
    public IAsyncEnumerable<User> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        return dbContext.Users.AsAsyncEnumerable();
    }
}