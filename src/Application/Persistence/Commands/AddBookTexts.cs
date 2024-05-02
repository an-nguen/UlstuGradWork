namespace BookManager.Application.Persistence.Commands;

public sealed record AddBookTexts : IRequest
{
    public required IEnumerable<BookText> Texts { get; init; }
}

public sealed class AddDocumentTextsHandler(IAppDbContext dbContext): IRequestHandler<AddBookTexts>
{
    public async Task Handle(AddBookTexts request, CancellationToken cancellationToken)
    {
        dbContext.BookTexts.AddRange(request.Texts);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}