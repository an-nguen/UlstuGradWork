namespace BookManager.Application.Persistence.Commands;

public sealed record AddDocumentTextsCommand : IRequest
{
    public required IEnumerable<BookDocumentText> DocumentTexts { get; init; }
}

public sealed class AddDocumentTextsHandler(IAppDbContext dbContext): IRequestHandler<AddDocumentTextsCommand>
{
    public async Task Handle(AddDocumentTextsCommand request, CancellationToken cancellationToken)
    {
        dbContext.BookDocumentsTexts.AddRange(request.DocumentTexts);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}