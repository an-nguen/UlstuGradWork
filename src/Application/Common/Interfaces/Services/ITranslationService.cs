using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface ITranslationService
{
    public Task<IEnumerable<LanguageDto>> ListLanguagesAsync();
    
    public Task<DetectLanguageResponseDto> DetectLanguageAsync(DetectLanguageRequestDto request);
    
    public Task<TranslationResponseDto> TranslateAsync(TranslationRequestDto request);
}