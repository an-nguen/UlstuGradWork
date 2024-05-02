namespace BookManager.Application.Persistence.Commands;

public sealed record AddBookDocumentCommand(BookDocument BookDocument) : IRequest<BookDocument>;

public sealed class AddBookDocumentHandler(IAppDbContext dbContext) : IRequestHandler<AddBookDocumentCommand, BookDocument>
{
    public async Task<BookDocument> Handle(AddBookDocumentCommand request, CancellationToken cancellationToken)
    {
        var entry = dbContext.BookDocuments.Add(request.BookDocument);
        await dbContext.SaveChangesAsync(cancellationToken);
        return entry.Entity;
    }
}