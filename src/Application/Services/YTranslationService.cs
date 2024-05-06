using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces;
using Yandex.Cloud;
using Yandex.Cloud.Ai.Translate.V2;

namespace BookManager.Application.Services;

public class YTranslationService(Sdk sdk) : ITranslationService
{
    public async Task<TranslationResponseDto> TranslateAsync(TranslationRequestDto request)
    {
        var client = sdk.Services.Ai.Translate.TranslationService;
        var response = await client.TranslateAsync(new TranslateRequest()
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