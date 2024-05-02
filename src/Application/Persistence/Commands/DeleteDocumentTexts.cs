namespace BookManager.Application.Persistence.Commands;

public sealed record DeleteDocumentTextsCommand(Guid BookDocumentId): IRequest<int>;

public sealed class DeleteDocumentTextsHandler(IAppDbContext dbContext): IRequestHandler<DeleteDocumentTextsCommand, int>
{
    public async Task<int> Handle(DeleteDocumentTextsCommand request, CancellationToken cancellationToken)
    {
        return await dbContext.BookDocumentsTexts.Where(text => text.BookDocumentId == request.BookDocumentId)
            .ExecuteDeleteAsync(cancellationToken);
    }
}