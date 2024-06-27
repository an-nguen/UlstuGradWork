using System.Net.Http.Json;
using System.Text.Json;
using BookManager.Application.Common.DTOs;

namespace BookManager.Tests.Api.IntegrationTests;

[Collection("Api collection")]
public class SearchTests(ApiFixture apiFixture)
{
    private readonly HttpClient _client = apiFixture.CreateAuthenticatedClient(Constants.SomeUserName, Constants.SomeUserPinCode);
    private readonly JsonSerializerOptions _jsonSerializerOptions = new(JsonSerializerDefaults.Web);

    [Fact]
    public async Task Search_ReturnsBookList()
    {
        await BookControllerTests.AddBookAsync(_client, _jsonSerializerOptions, Constants.TestFilepath);
        await BookControllerTests.AddBookAsync(_client, _jsonSerializerOptions, Constants.AnotherTestFilepath);
        var request = new SearchRequestDto
        {
            Title = "PDF",
            PageSize = 10,
            PageNumber = 0
        };
        var responseMessage = await _client.PostAsync("/books/search", JsonContent.Create(request));
        var page = JsonSerializer.Deserialize<PageDto<BookDto>>(
            await responseMessage.Content.ReadAsStreamAsync(),
            _jsonSerializerOptions
        );
        Assert.NotNull(page);
        Assert.NotEmpty(page.Items);
    }
}