using System.Text.Json.Serialization;

namespace BookManager.Application.Common.DTOs;

// https://dictionaryapi.com/products/json
public sealed record MerriamWebsterDefDto
{
    public EntryMetadata? Meta { get; init; }

    // Homographs are headwords with identical spellings but distinct meanings and origins.
    [JsonPropertyName("hom")]
    public int Homograph { get; init; }

    [JsonPropertyName("fl")]
    public string FunctionalLabel { get; init; } = string.Empty;

    // A variant is a different spelling or styling of a headword,
    // defined run-on phrase, or undefined entry word.
    [JsonPropertyName("vrs")]
    public Variant[] Variants { get; init; } = [];

    // Заглавное слово (Headword)
    // The headword is the word being defined or translated in a dictionary entry.
    [JsonPropertyName("hwi")]
    public HeadwordInformation? HeadwordInfo { get; init; }
    
    // The definition section groups together all the sense sequences
    // and verb dividers for a headword or defined run-on phrase.
    [JsonPropertyName("def")]
    public object[] DefinitionSection { get; init; } = [];
    
    // A short definition provides a highly abridged version of the main definition section,
    // consisting of just the definition text for the first three senses.
    [JsonPropertyName("shortdef")]
    public string ShortDefinition { get; init; } = string.Empty;

    public record EntryMetadata(
        string Id,
        string Uuid,
        string Sort,
        string Src,
        string Section,
        string[] Stems,
        bool Offensive
    );

    public record HeadwordInformation
    {
        [JsonPropertyName("prs")] 
        public Pronuciation[]? Pronunciations { get; init; }
        
        public object? Sound { get; init; }
    }

    public record Pronuciation
    {
        [JsonPropertyName("mw")]
        public string WrittenPronunciation { get; init; } = string.Empty;
    }

    public record Variant
    {
        public string Va { get; init; } = string.Empty;
        
        [JsonPropertyName("vl")]
        public string? VariantLabel { get; init; }
        
        [JsonPropertyName("prs")] 
        public Pronuciation[]? Pronunciations { get; init; }
    }
}