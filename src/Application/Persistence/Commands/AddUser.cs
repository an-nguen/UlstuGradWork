namespace BookManager.Application.Persistence.Commands;

public sealed record AddUserCommand(User NewUser): IRequest<User>;

public sealed class AddUserCommandHandler(IAppDbContext dbContext) : IRequestHandler<AddUserCommand, User>
{
    public async Task<User> Handle(AddUserCommand request, CancellationToken cancellationToken)
    {
        var entry = dbContext.Users.Add(request.NewUser);
        await dbContext.SaveChangesAsync(cancellationToken);
        return entry.Entity;
    }
}