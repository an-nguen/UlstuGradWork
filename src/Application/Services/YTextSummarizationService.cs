using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using BookManager.Application.Common.Config;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces.Services;
using Microsoft.Extensions.Options;
using Yandex.Cloud.Ai.FoundationModels.V1;
using Yandex.Cloud.Credentials;


[JsonSourceGenerationOptions(JsonSerializerDefaults.Web)]
[JsonSerializable(typeof(CompletionResponseDto))]
[JsonSerializable(typeof(CompletionRequest))]
internal partial class TextSumContext : JsonSerializerContext;

internal sealed class YTextSummarizationService(
    HttpClient client,
    ICredentialsProvider credentialsProvider,
    IOptions<YandexCloudOptions> options)
    : ITextSummarizationService
{
    private readonly YandexCloudOptions _options = options.Value;

    public async Task<TextSummarizationResponseDto> SummarizeTextAsync(TextSummarizationRequestDto request)
    {
        var message = new Message
        {
            Role = "user",
            Text = request.Text
        };
        var completionRequest = new CompletionRequest
        {
            ModelUri = _options.ModelSummarizationUri,
            Messages = { message },
            CompletionOptions = new CompletionOptions
            {
                Stream = false,
                Temperature = _options.ModelSummarizationTemperature,
                MaxTokens = 1000
            },
        };
        var token = credentialsProvider.GetToken();
        if (token == null) throw new Exception("Failed to get IAM token to Yandex Cloud");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var jsonContent = JsonContent.Create(completionRequest, TextSumContext.Default.CompletionRequest);
        var responseMessage =
            await client.PostAsync("foundationModels/v1/completion", jsonContent);
        if (responseMessage.StatusCode != HttpStatusCode.OK)
        {
            throw new Exception(responseMessage.ReasonPhrase);
        }
        var response = JsonSerializer.Deserialize(
            await responseMessage.Content.ReadAsStreamAsync(),
            TextSumContext.Default.CompletionResponseDto
        );
        if (response == null) throw new Exception("Failed to deserialize a response message");
        var sb = new StringBuilder();
        sb.Append(string.Join('\n', response.Result.Alternatives.Select(a => string.Join('\n', a.Message.Text))));
        sb.Append('\n');

        return new TextSummarizationResponseDto(sb.ToString());
    }
}