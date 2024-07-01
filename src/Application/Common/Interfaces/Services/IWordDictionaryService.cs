using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface IWordDictionaryService : IPageableService<DictionaryWord, WordDto>
{
    public IEnumerable<string> GetThirdPartyProviderNames();

    public Task<IEnumerable<WordDto>> FindAsync(string word);

    public Task<IEnumerable<WordDto>> FindInExtDictAsync(string word, string thirdPartyProviderName);

    public Task<WordDto> AddWordAsync(WordDto word, User user);

    public Task<WordDto> UpdateWordAsync(string wordId, WordDto word, User user);

    public Task DeleteWordAsync(string word, User user);
}