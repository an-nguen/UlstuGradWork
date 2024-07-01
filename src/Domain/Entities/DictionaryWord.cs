using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace BookManager.Domain.Entities;

public sealed class DictionaryWord
{
    [Key]
    public string Word { get; init; } = null!;

    public string? Transcription { get; set; } = string.Empty;

    public string? LanguageCode { get; set; } = string.Empty;

    // Основы слова (лингвистика)
    public string[]? Stems { get; set; }

    public ICollection<DictionaryWordDefinition> Definitions { get; init; } = [];

    public Guid? UserId { get; set; }

    public User? User { get; set; }

    public Instant CreatedAt { get; init; }

    public Instant? UpdatedAt { get; set; }
}