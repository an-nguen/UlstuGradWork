using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace BookManager.Domain.Entities;

public class BookDocumentGroup
{
    [Key]
    public Guid Id { get; init; }
    
    public required string Name { get; init; }

    public ICollection<BookDocument> BookDocuments { get; set; } = new List<BookDocument>();
    
    public Instant CreatedAt { get; init; }
}