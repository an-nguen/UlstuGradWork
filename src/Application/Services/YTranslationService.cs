using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces;
using Yandex.Cloud;
using Yandex.Cloud.Ai.Translate.V2;

namespace BookManager.Application.Services;

public class YTranslationService(Sdk sdk) : ITranslationService
{
    private readonly TranslationService.TranslationServiceClient _client = sdk.Services.Ai.Translate.TranslationService;
    
    public async Task<DetectLanguageResponseDto> DetectLanguageAsync(DetectLanguageRequestDto request)
    {
        var response = await _client.DetectLanguageAsync(new DetectLanguageRequest
        {
            Text = request.Text 
        });
        return new DetectLanguageResponseDto(response.LanguageCode);
    }
    
    public async Task<TranslationResponseDto> TranslateAsync(TranslationRequestDto request)
    {
        var response = await _client.TranslateAsync(new TranslateRequest
        {
            FolderId = "b1gufe1qhoee0datf38t",
            TargetLanguageCode = request.TargetLanguage,
            Texts = { request.SourceText }
        });
        var dto = new TranslationResponseDto
        {
            TranslatedText = string.Join('\n', response.Translations.Select(t => t.Text))
        };
        return dto;
    }
}