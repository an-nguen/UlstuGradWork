using System.Text.Json;
using System.Text.RegularExpressions;
using BookManager.Application.Common.Config;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using BookManager.Application.Common.Interfaces.Services;
using Flurl;
using Microsoft.Extensions.Options;

namespace BookManager.Application.Services;

public partial class MerriamWebsterDictionaryProvider(
    HttpClient httpClient,
    IOptions<MerriamWebsterOptions> options)
    : IThirdPartyDictionaryProvider
{
    private const string RequestUri = "https://www.dictionaryapi.com/api/v3/references/collegiate/json";

    private readonly MerriamWebsterOptions _options = options.Value;
    private readonly JsonSerializerOptions _jsonSerializerOptions = new(JsonSerializerDefaults.Web);
    private readonly Regex _wordIdRegex = WordIdRegex();

    public string ProviderName => "MerriamWebster";

    public async Task<IEnumerable<WordDto>> GetDefinitionAsync(string word)
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
        try
        {
            await using var contentStream = await responseMessage.Content.ReadAsStreamAsync();
            var results = await JsonSerializer.DeserializeAsync<ICollection<MerriamWebsterDefDto>>(
                contentStream,
                _jsonSerializerOptions
            );
            if (results == null) return [];

            var words = new List<WordDto>();
            foreach (var def in results)
            {
                if (string.IsNullOrEmpty(def.HeadwordInfo.Headword)
                    || def.ShortDefinition is { Length: 0 }
                    || def.HeadwordInfo.Pronunciations is { Length: 0 }
                    || string.IsNullOrEmpty(def.HeadwordInfo.Pronunciations?[0].WrittenPronunciation)
                   )
                    continue;

                var normalizedWordId = _wordIdRegex.Replace(def.Meta.Id, string.Empty);
                var transcription = def.HeadwordInfo.Pronunciations[0].WrittenPronunciation;
                var definitions = def.ShortDefinition
                    .Select(definition => new WordDefinitionDto(def.FunctionalLabel, "", definition))
                    .ToList();
                var stems = def.Meta.Stems.ToArray();
                var similarWord = words.FirstOrDefault(w => w.Word == normalizedWordId);
                if (similarWord != null)
                {
                    similarWord.Stems = new List<string>([.. similarWord.Stems, .. stems])
                                            .Distinct()
                                            .ToArray();
                    definitions.ForEach(similarWord.Definitions.Add);
                }
                else
                {
                    words.Add(
                        new WordDto
                        {
                            Word = normalizedWordId,
                            Transcription = transcription,
                            LanguageCode = string.Empty,
                            Stems = stems,
                            Definitions = definitions
                        }
                    );
                }
            }

            return words;
        }
        catch (Exception)
        {
            return new List<WordDto>();
        }
    }

    [GeneratedRegex(":\\d$")]
    private static partial Regex WordIdRegex();
}