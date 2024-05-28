using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface IThirdPartyDictionaryProvider
{
    public string ProviderName { get; }
    
    public Task<IEnumerable<WordDto>> GetDefinitionAsync(string word);
}