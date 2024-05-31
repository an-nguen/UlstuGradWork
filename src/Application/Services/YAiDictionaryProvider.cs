using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using BookManager.Application.Common.Config;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Yandex.Cloud.Ai.FoundationModels.V1;
using Yandex.Cloud.Credentials;

namespace BookManager.Application.Services;

public class YAiDictionaryProvider(
    ILogger<YAiDictionaryProvider> logger,
    HttpClient client,
    ICredentialsProvider credentialsProvider,
    IOptions<YandexCloudOptions> options)
    : IThirdPartyDictionaryProvider
{
    public string ProviderName => "YandexAi";
    private readonly YandexCloudOptions _options = options.Value;
    private readonly JsonSerializerOptions _serializerOptions = new(JsonSerializerDefaults.Web);
    private const string RequestUri = "https://llm.api.cloud.yandex.net";
    private const string JsonDivider = "```";

    public async Task<IEnumerable<WordDto>> GetDefinitionAsync(string word)
    {
        if (!ValidateWord(word))
        {
            throw new ArgumentException("Invalid word", nameof(word));
        }

        var message = new Message
        {
            Role = "user",
            Text = GetPromptString(word)
        };
        var completionRequest = new CompletionRequest
        {
            ModelUri = _options.GptModelUri,
            Messages = { message },
            CompletionOptions = new CompletionOptions
            {
                Stream = false,
                Temperature = _options.GptModelTemperature,
                MaxTokens = 1000
            },
        };
        var token = credentialsProvider.GetToken();
        if (token == null) throw new Exception("Failed to get IAM token to Yandex Cloud");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var responseMessage =
            await client.PostAsync($"{RequestUri}/foundationModels/v1/completion",
                JsonContent.Create(completionRequest));
        if (responseMessage.StatusCode != HttpStatusCode.OK)
            throw new Exception(responseMessage.ReasonPhrase);

        var response = JsonSerializer.Deserialize<CompletionResponse>(await responseMessage.Content.ReadAsStreamAsync(),
            _serializerOptions);
        if (response == null) throw new Exception("Failed to deserialize a response message");
        if (!response.Result.Alternatives.Any()) return new List<WordDto>();

        var resultText = response.Result
            .Alternatives
            .ElementAt(0)
            .Message
            .Text
            .Replace("\n", "")
            .Replace("/", "");
        try
        {
            var startIndexOfJsonResult = resultText.IndexOf(JsonDivider, StringComparison.Ordinal);
            var endIndexOfJsonResult = resultText.IndexOf(
                JsonDivider,
                startIndexOfJsonResult + JsonDivider.Length,
                StringComparison.Ordinal
            );
            var jsonStringResult = startIndexOfJsonResult == -1 || endIndexOfJsonResult == -1
                ? resultText
                : resultText.Substring(
                    startIndexOfJsonResult + JsonDivider.Length,
                    endIndexOfJsonResult - JsonDivider.Length
                ).Trim();
            var wordDto = JsonSerializer.Deserialize<WordDto>(
                jsonStringResult,
                _serializerOptions
            );
            return wordDto != null ? [wordDto] : new List<WordDto>();
        }
        catch (Exception e)
        {
            logger.LogError("The response message parsing error: {}", e.Message);
        }

        return new List<WordDto>();
    }

    private static bool ValidateWord(string word)
    {
        return word.Split(' ').Length < 3;
    }

    private static string GetPromptString(string word)
    {
        return
            $"Найди определение для слова '{word}'. Верни результат в виде JSON объект на примере ```{{ \"word\": \"go\", \"transcription\": \"[gəu]\",\"definitions\":" +
            "[{\"partOfSpeech\": \"verb\", \"definition\": \"to get dressed and prepare for the day or an event\" }," +
            "{\"partOfSpeech\": \"phrasal verb\", \"definition\": \"to stand up after sitting or lying down\" } ]}```";
    }
}