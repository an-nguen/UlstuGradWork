namespace BookManager.Application.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
{
    public DbSet<Book> Books => Set<Book>();

    public DbSet<BookText> BookTexts => Set<BookText>();

    public DbSet<User> Users => Set<User>();

    public DbSet<BookUserStats> BookUserStatsSet => Set<BookUserStats>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BookUserStats>()
            .HasKey(s => new {s.BookId, s.UserId});
        modelBuilder.Entity<BookText>()
            .HasIndex(bdt => bdt.Text)
            .HasMethod("GIN")
            .IsTsVectorExpressionIndex("english");
    }
}