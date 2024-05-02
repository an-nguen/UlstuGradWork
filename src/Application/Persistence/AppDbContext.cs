namespace BookManager.Application.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
{
    public DbSet<BookDocument> BookDocuments => Set<BookDocument>();

    public DbSet<BookDocumentText> BookDocumentsTexts => Set<BookDocumentText>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BookDocument>()
            .HasIndex(b => b.FileHash);
        modelBuilder.Entity<BookDocumentGroup>()
            .HasMany(group => group.BookDocuments)
            .WithOne(bookDocument => bookDocument.Group)
            .HasForeignKey(bookDocument => bookDocument.GroupId)
            .OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<BookDocumentGroup>()
            .Property(group => group.CreatedAt)
            .ValueGeneratedOnAdd();
        modelBuilder.Entity<BookDocumentText>()
            .HasIndex(bdt => bdt.Text)
            .HasMethod("GIN")
            .IsTsVectorExpressionIndex("english");
    }
}