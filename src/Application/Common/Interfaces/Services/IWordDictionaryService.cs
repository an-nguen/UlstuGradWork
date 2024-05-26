using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface IWordDictionaryService
{
    public Task<WordDto?> Find(string word); 

    public Task<WordDto> AddWord(WordDto word);

    public Task<WordDto> UpdateWord(string wordId, WordDto word);

    public Task DeleteWord(string word);
}