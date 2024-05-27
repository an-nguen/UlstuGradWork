using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface IWordDictionaryService
{
    public IEnumerable<string> GetThirdPartyProviderNames();
    
    public Task<WordDto?> FindAsync(string word, string? thirdPartyProviderName);

    public Task<WordDto> AddWordAsync(WordDto word);

    public Task<WordDto> UpdateWordAsync(string wordId, WordDto word);

    public Task DeleteWordAsync(string word);
}