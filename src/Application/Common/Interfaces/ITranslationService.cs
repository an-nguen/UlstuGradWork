using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces;

public interface ITranslationService
{
    public Task<TranslationResponseDto> TranslateAsync(TranslationRequestDto request);
}