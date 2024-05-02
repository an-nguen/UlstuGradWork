namespace BookManager.Application.Common.Interfaces.Persistence;

public interface IAppDbContext
{
    DbSet<Book> Books { get; }

    DbSet<BookText> BookTexts { get; }
    
    DbSet<User> Users { get; }
    
    DbSet<BookUserStats> BookUserStatsSet { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}