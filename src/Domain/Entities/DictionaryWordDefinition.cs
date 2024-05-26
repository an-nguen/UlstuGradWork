using System.ComponentModel.DataAnnotations;

namespace BookManager.Domain.Entities;

public sealed class DictionaryWordDefinition
{
    [Key] public Guid Id { get; init; }
    
    [MaxLength(1024)]
    public required string SubjectName { get; init; }
    
    [MaxLength(8192)]
    public required string Definition { get; init; }

    public string PartOfSpeech { get; init; } = null!;
    
    public string DictionaryWordId { get; init; } = null!;

    public DictionaryWord Word { get; init; } = null!;
}