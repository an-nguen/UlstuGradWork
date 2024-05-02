using BookManager.Application.Common.Exceptions;

namespace BookManager.Application.Persistence.Commands;

public record DeleteBookDocumentCommand(Guid Id) : IRequest;

public sealed class DeleteBookDocumentHandler(IAppDbContext dbContext) : IRequestHandler<DeleteBookDocumentCommand>
{
    public async Task Handle(DeleteBookDocumentCommand request, CancellationToken cancellationToken)
    {
        var document = await dbContext.BookDocuments.FindAsync([request.Id], cancellationToken)
                       ?? throw new EntityNotFoundException();
        dbContext.BookDocuments.Remove(document);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}