using System.Text.Json;
using BookManager.Application.Common.Config;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using BookManager.Application.Common.Interfaces.Services;
using Flurl;
using Microsoft.Extensions.Options;

namespace BookManager.Application.Services;

public class MerriamWebsterDictionaryProvider(
    HttpClient httpClient,
    IOptions<MerriamWebsterOptions> options)
    : IThirdPartyDictionaryProvider
{
    private const string RequestUri = "https://www.dictionaryapi.com/api/v3/references/collegiate/json";

    private readonly MerriamWebsterOptions _options = options.Value;
    private readonly JsonSerializerOptions _jsonSerializerOptions = new(JsonSerializerDefaults.Web);

    public string ProviderName => "MerriamWebster";

    public async Task<WordDto?> GetDefinitionAsync(string word)
    {
        if (string.IsNullOrEmpty(_options.ApiKey.Trim()))
            throw new NotAvailableException(
                $"The API key is not defined for {nameof(MerriamWebsterDictionaryProvider)} service."
            );

        var requestUri = RequestUri.AppendPathSegment(word.Trim('/'))
            .AppendQueryParam("key", _options.ApiKey)
            .ToUri();
        var requestMessage = new HttpRequestMessage
        {
            Method = HttpMethod.Get,
            RequestUri = requestUri,
        };
        var responseMessage = await httpClient.SendAsync(requestMessage);
        var contentStream = await responseMessage.Content.ReadAsStreamAsync();
        var results = await JsonSerializer.DeserializeAsync<ICollection<MerriamWebsterDefDto>>(
            contentStream,
            _jsonSerializerOptions
        );
        if (results == null) return null;
        string? transcription = null;
        var definitions = new List<WordDefinitionDto>();
        foreach (var def in results)
        {
            if (transcription == null && def.HeadwordInfo?.Pronunciations is { Length: > 0 })
                transcription = def.HeadwordInfo.Pronunciations[0].WrittenPronunciation;

            definitions.Add(new WordDefinitionDto(def.FunctionalLabel, "", def.ShortDefinition));
        }

        return new WordDto(
            word,
            transcription,
            "en",
            definitions
        );
    }
}