using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces.Services;
using Microsoft.IdentityModel.Tokens;
using Yandex.Cloud;
using Yandex.Cloud.Ai.Translate.V2;

namespace BookManager.Application.Services;

public class YTranslationService(Sdk sdk) : ITranslationService
{
    private readonly TranslationService.TranslationServiceClient _client = sdk.Services.Ai.Translate.TranslationService;

    public async Task<IEnumerable<LanguageDto>> ListLanguagesAsync()
    {
        var list = await _client.ListLanguagesAsync(new ListLanguagesRequest());
        return list.Languages.Select(l => new LanguageDto(l.Code, l.Name));
    }
    
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
        var translationRequest = new TranslateRequest
        {
            TargetLanguageCode = request.TargetLanguage,
            Texts = { request.SourceText }
        };
        if (request.SourceLanguage != null) translationRequest.SourceLanguageCode = request.SourceLanguage;
        var response = await _client.TranslateAsync(translationRequest);
        if (response.Translations.IsNullOrEmpty())
        {
            throw new Exception("Failed to translate text");
        }
        var dto = new TranslationResponseDto
        {
            DetectedSourceLanguage = response.Translations[0].DetectedLanguageCode,
            TargetLanguage = request.TargetLanguage,
            TranslatedText = string.Join('\n', response.Translations.Select(t => t.Text))
        };
        return dto;
    }
}