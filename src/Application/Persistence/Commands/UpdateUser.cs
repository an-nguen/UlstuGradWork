namespace BookManager.Application.Persistence.Commands;

public sealed record UpdateUserCommand(User User): IRequest<User>;

public sealed class UpdateUserCommandHandler(IAppDbContext dbContext) : IRequestHandler<UpdateUserCommand, User>
{
    public async Task<User> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var entry = dbContext.Users.Update(request.User);
        await dbContext.SaveChangesAsync(cancellationToken);
        return entry.Entity;
    }
}