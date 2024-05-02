namespace BookManager.Application.Common.Interfaces.Persistence;

public interface IAppDbContext
{
    DbSet<BookDocument> BookDocuments { get; }

    DbSet<BookDocumentText> BookDocumentsTexts { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}