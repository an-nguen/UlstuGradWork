using NodaTime;
using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public sealed record WordDefinitionDto(string PartOfSpeech, string SubjectName, string Definition)
{
    public DictionaryWordDefinition ToEntity()
    {
        return new DictionaryWordDefinition
        {
            SubjectName = SubjectName,
            PartOfSpeech = PartOfSpeech,
            Definition = Definition
        };
    }
}

[TranspilationSource]
public sealed class WordDto
{
    public Guid? Id { get; init; }
    public required string Word { get; set; }
    public string? Transcription { get; set; }
    public string? LanguageCode { get; set; }
    public string[]? Stems { get; set; }
    public ICollection<WordDefinitionDto> Definitions { get; set; } = [];
    public string? Username { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    public DictionaryWord ToEntity()
    {
        return new DictionaryWord
        {
            Id = Id != null ? Id.Value : Guid.Empty,
            Word = Word,
            Transcription = Transcription,
            LanguageCode = LanguageCode,
            Stems = Stems,
            Definitions = Definitions.Select(d => d.ToEntity()).ToList(),
            CreatedAt = SystemClock.Instance.GetCurrentInstant(),
            UpdatedAt = SystemClock.Instance.GetCurrentInstant(),
        };
    }
}

public static class DictionaryWordExtension
{
    public static WordDto ToDto(this DictionaryWord word)
    {
        return new WordDto
        {
            Id = word.Id,
            Word = word.Word,
            Transcription = word.Transcription,
            LanguageCode = word.LanguageCode,
            Stems = word.Stems,
            Definitions = word.Definitions.Select(wordDef => wordDef.ToDto()).ToList(),
            Username = word.User?.UserName,
            CreatedAt = word.CreatedAt.ToDateTimeOffset(),
            UpdatedAt = word.UpdatedAt?.ToDateTimeOffset(),
        };
    }

    public static WordDefinitionDto ToDto(this DictionaryWordDefinition definition)
    {
        return new WordDefinitionDto(definition.PartOfSpeech, definition.SubjectName, definition.Definition);
    }
}

public record WordsApiWordDefinitionResponseDto
{
    public string Word { get; init; } = null!;
    public IEnumerable<WordDefinition> Definitions { get; } = new List<WordDefinition>();

    public record WordDefinition(string Definition, string PartOfSpeech);
}