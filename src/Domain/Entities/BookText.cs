using System.ComponentModel.DataAnnotations;

namespace BookManager.Domain.Entities;

public sealed class BookText
{
    [Key] 
    public Guid Id { get; init; }
    
    // 4 MiB
    [MaxLength(4194304)] 
    public required string Text { get; init; } = null!;

    public Guid BookDocumentId { get; init; }
    
    public int? PageNumber { get; init; }
}