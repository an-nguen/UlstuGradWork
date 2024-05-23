using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace BookManager.Domain.Entities;

public class BookCollection
{
    [Key]
    public Guid Id { get; init; }
    
    public required string Name { get; init; }

    public ICollection<Book> Books { get; set; } = new List<Book>();
    
    public Instant CreatedAt { get; init; }
}