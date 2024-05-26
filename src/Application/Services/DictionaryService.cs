using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using BookManager.Application.Common.Interfaces.Services;

namespace BookManager.Application.Services;

public sealed class DictionaryService(IAppDbContext dbContext) : IWordDictionaryService
{
    public async Task<WordDto?> Find(string word)
    {
        var foundDictWord = await dbContext.DictionaryWords.FirstOrDefaultAsync(w => w.Word == word);
        return foundDictWord?.ToDto();
    }

    public async Task<WordDto> AddWord(WordDto word)
    {
        var entry = dbContext.DictionaryWords.Add(word.ToEntity());
        await dbContext.SaveChangesAsync();
        return entry.Entity.ToDto();
    }

    public async Task<WordDto> UpdateWord(string wordId, WordDto word)
    {
        var foundEntity = await dbContext.DictionaryWords.FindAsync(wordId);
        if (foundEntity == null) throw new EntityNotFoundException();
        foundEntity.Transcription = word.Transcription;
        foundEntity.LanguageCode = word.LanguageCode;
        foundEntity.Definitions.Clear();
        foreach (var wordDef in word.Definitions)
        {
            foundEntity.Definitions.Add(wordDef.ToEntity());
        }
        var entry = dbContext.DictionaryWords.Update(foundEntity);
        await dbContext.SaveChangesAsync();
        return entry.Entity.ToDto();
    }

    public async Task DeleteWord(string word)
    {
        var foundEntity = await dbContext.DictionaryWords.FindAsync(word);
        if (foundEntity == null) throw new EntityNotFoundException();
        dbContext.DictionaryWords.Remove(foundEntity);
        await dbContext.SaveChangesAsync();
    }
}