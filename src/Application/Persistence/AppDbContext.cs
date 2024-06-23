using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace BookManager.Application.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityUserContext<User, Guid>(options), IAppDbContext
{
    public DbSet<BookCollection> BookCollections => Set<BookCollection>();

    public DbSet<Book> Books => Set<Book>();

    public DbSet<BookText> BookTexts => Set<BookText>();

    public DbSet<BookUserStats> BookUserStatsSet => Set<BookUserStats>();

    public DbSet<DictionaryWord> DictionaryWords => Set<DictionaryWord>();

    public DbSet<Ticket> Tickets => Set<Ticket>();

    public DbSet<TotalReadingTime> TotalReadingTimes => Set<TotalReadingTime>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<User>(u => u.ToTable("users"));
        modelBuilder.Entity<IdentityRole>(r => r.ToTable("user_roles"));
        modelBuilder.Entity<IdentityUserLogin<Guid>>(r => r.ToTable("user_logins"));
        modelBuilder.Entity<IdentityUserClaim<Guid>>(r => r.ToTable("user_claims"));
        modelBuilder.Entity<IdentityUserToken<Guid>>(r => r.ToTable("user_tokens"));
        modelBuilder.Entity<BookUserStats>()
            .HasKey(s => new { s.BookId, s.UserId });
        modelBuilder.Entity<BookText>()
            .HasIndex(bdt => bdt.Text)
            .HasMethod("GIN")
            .IsTsVectorExpressionIndex("english");
        modelBuilder.Entity<Book>()
            .HasMany(b => b.Collections)
            .WithMany(bc => bc.Books);
        modelBuilder.Entity<DictionaryWord>()
            .Navigation(w => w.Definitions)
            .AutoInclude();
        modelBuilder.Entity<TotalReadingTime>()
            .HasKey(trt => new { trt.BookId, trt.TicketId });
        modelBuilder.Entity<TotalReadingTime>()
            .Navigation(trt => trt.Ticket)
            .AutoInclude();
    }
}