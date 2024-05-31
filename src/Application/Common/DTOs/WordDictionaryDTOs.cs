﻿using Tapper;

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
public sealed record WordAlias(string Alias)
{
    public DictionaryWordAlias ToEntity()
    {
        return new DictionaryWordAlias
        {
            Alias = Alias
        };
    }
}

[TranspilationSource]
public sealed record WordDto(
    string Word,
    string? Transcription,
    string? LanguageCode,
    ICollection<WordAlias> Aliases,
    ICollection<WordDefinitionDto> Definitions)
{
    public DictionaryWord ToEntity()
    {
        var word = new DictionaryWord
        {
            Word = Word,
            Transcription = Transcription,
            LanguageCode = LanguageCode
        };

        foreach (var definition in Definitions.Select(def => def.ToEntity()))
        {
            word.Definitions.Add(definition);
        }

        return word;
    }
}

public static class DictionaryWordExtension
{
    public static WordDto ToDto(this DictionaryWord word)
    {
        return new WordDto(
            word.Word,
            word.Transcription,
            word.LanguageCode,
            word.Aliases.Select(a => a.ToDto()).ToList(),
            word.Definitions.Select(wordDef => wordDef.ToDto()).ToList()
        );
    }

    public static WordDefinitionDto ToDto(this DictionaryWordDefinition definition)
    {
        return new WordDefinitionDto(definition.PartOfSpeech, definition.SubjectName, definition.Definition);
    }

    public static WordAlias ToDto(this DictionaryWordAlias alias)
    {
        return new WordAlias(alias.Alias);
    }
}

public record WordsApiWordDefinitionResponseDto
{
    public string Word { get; init; } = null!;
    public IEnumerable<WordDefinition> Definitions { get; } = new List<WordDefinition>();

    public record WordDefinition(string Definition, string PartOfSpeech);
}