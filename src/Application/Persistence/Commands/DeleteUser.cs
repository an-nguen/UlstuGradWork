using BookManager.Application.Common.Exceptions;

namespace BookManager.Application.Persistence.Commands;

public sealed record DeleteUserCommand(Guid Id): IRequest;

public sealed class DeleteUserCommandHandler(IAppDbContext dbContext) : IRequestHandler<DeleteUserCommand>
{
    public async Task Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var entry = await dbContext.Users.FindAsync([request.Id], cancellationToken) 
                    ?? throw new EntityNotFoundException();
        dbContext.Users.Remove(entry);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}