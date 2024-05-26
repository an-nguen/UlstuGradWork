namespace BookManager.Application.Common.Interfaces.Persistence;

public interface IAppDbContext
{
    DbSet<BookCollection> BookCollections { get; }
    
    DbSet<Book> Books { get; }

    DbSet<BookText> BookTexts { get; }
    
    DbSet<User> Users { get; }
    
    DbSet<BookUserStats> BookUserStatsSet { get; }
    
    DbSet<DictionaryWord> DictionaryWords { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}