namespace BookManager.Application.Common.Interfaces.Persistence;

public interface IAppDbContext
{
    DbSet<BookCollection> BookCollections { get; }

    DbSet<Book> Books { get; }

    DbSet<BookText> BookTexts { get; }

    DbSet<User> Users { get; }

    DbSet<BookUserStats> BookUserStatsSet { get; }

    DbSet<DictionaryWord> DictionaryWords { get; }

    DbSet<Ticket> Tickets { get; }

    DbSet<TotalReadingTime> TotalReadingTimes { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}