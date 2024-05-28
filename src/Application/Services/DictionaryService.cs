using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using BookManager.Application.Common.Interfaces.Services;
using FluentValidation;

namespace BookManager.Application.Services;

public sealed class DictionaryService(
    IAppDbContext dbContext,
    IEnumerable<IThirdPartyDictionaryProvider> thirdPartyDictionaryProviders,
    IValidator<WordDto> validator) : IWordDictionaryService
{
    public IEnumerable<string> GetThirdPartyProviderNames()
    {
        return thirdPartyDictionaryProviders.Select(provider => provider.ProviderName).ToList();
    }

    public async Task<IEnumerable<WordDto>> FindAsync(string word)
    {
        return await dbContext.DictionaryWords
            .Where(w => w.Word == word || w.Aliases.Select(alias => alias.Alias).Contains(word))
            .Select(w => w.ToDto())
            .ToListAsync();
    }

    public async Task<IEnumerable<WordDto>> FindInExtDictAsync(string word, string thirdPartyProviderName)
    {
        var provider =
            thirdPartyDictionaryProviders.FirstOrDefault(provider => provider.ProviderName == thirdPartyProviderName);
        if (provider == null)
            throw new ArgumentException(null, nameof(thirdPartyProviderName));
        return await provider.GetDefinitionAsync(word);
    }

    public async Task<WordDto> AddWordAsync(WordDto word)
    {
        var validationResult = await validator.ValidateAsync(word);
        if (!validationResult.IsValid) throw new ArgumentException("Invalid word", nameof(word));
        var entry = dbContext.DictionaryWords.Add(word.ToEntity());
        await dbContext.SaveChangesAsync();
        return entry.Entity.ToDto();
    }

    public async Task<WordDto> UpdateWordAsync(string wordId, WordDto word)
    {
        var validationResult = await validator.ValidateAsync(word);
        if (!validationResult.IsValid) throw new ArgumentException("Invalid word", nameof(word));
        var foundEntity = await dbContext.DictionaryWords.FindAsync(wordId);
        if (foundEntity == null) throw new EntityNotFoundException();
        foundEntity.Transcription = word.Transcription;
        foundEntity.LanguageCode = word.LanguageCode;
        foundEntity.Definitions.Clear();
        foreach (var wordDef in word.Definitions)
        {
            foundEntity.Definitions.Add(wordDef.ToEntity());
        }

        foundEntity.Aliases.Clear();
        foreach (var alias in word.Aliases)
        {
            foundEntity.Aliases.Add(alias.ToEntity());
        }

        var entry = dbContext.DictionaryWords.Update(foundEntity);
        await dbContext.SaveChangesAsync();
        return entry.Entity.ToDto();
    }

    public async Task DeleteWordAsync(string word)
    {
        var foundEntity = await dbContext.DictionaryWords.FindAsync(word);
        if (foundEntity == null) throw new EntityNotFoundException();
        dbContext.DictionaryWords.Remove(foundEntity);
        await dbContext.SaveChangesAsync();
    }
}