namespace BookManager.Application.Persistence.Commands;

public sealed record AddBookCommand(Book Book) : IRequest<Book>;

public sealed class AddBookHandler(IAppDbContext dbContext) : IRequestHandler<AddBookCommand, Book>
{
    public async Task<Book> Handle(AddBookCommand request, CancellationToken cancellationToken)
    {
        var entry = dbContext.Books.Add(request.Book);
        await dbContext.SaveChangesAsync(cancellationToken);
        return entry.Entity;
    }
}