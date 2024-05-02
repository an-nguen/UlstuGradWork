using System.Text.Json;

namespace BookManager.Tests.Api.IntegrationTests;

[Collection("Api collection")]
public class UserTests(ApiFixture apiFixture)
{
    private readonly HttpClient _client = apiFixture.CreateClient();
    private readonly JsonSerializerOptions _jsonSerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };
    
}