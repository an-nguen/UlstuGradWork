using BookManager.Application.Common.Exceptions;

namespace BookManager.Application.Persistence.Commands;

public record DeleteBookCommand(Guid Id) : IRequest;

public sealed class DeleteBookHandler(IAppDbContext dbContext) : IRequestHandler<DeleteBookCommand>
{
    public async Task Handle(DeleteBookCommand request, CancellationToken cancellationToken)
    {
        var document = await dbContext.Books.FindAsync([request.Id], cancellationToken)
                       ?? throw new EntityNotFoundException();
        dbContext.Books.Remove(document);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}