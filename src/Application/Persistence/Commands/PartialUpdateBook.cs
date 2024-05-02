
namespace BookManager.Application.Persistence.Commands;

public sealed record UpdateBookCommand(Book UpdatedBook) : IRequest<Book>;

public sealed class UpdateBookHandler(AppDbContext dbContext)
    : IRequestHandler<UpdateBookCommand, Book>
{
    public async Task<Book> Handle(UpdateBookCommand request,
        CancellationToken cancellationToken)
    {
        var entry = dbContext.Books.Update(request.UpdatedBook);
        await dbContext.SaveChangesAsync(cancellationToken);
        return entry.Entity;
    }
}