using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using BookManager.Application.Common.DTOs;

namespace BookManager.Tests.Api.IntegrationTests;

[Collection("Api collection")]
public class DictionaryTests(ApiFixture apiFixture)
{
    private const string RequestUri = "word-dictionary";
    private readonly HttpClient _client = apiFixture.CreateAuthenticatedClient();
    private readonly JsonSerializerOptions _jsonSerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    [Fact]
    public async Task AddWord_ReturnWord()
    {
        var lookupWord = new WordDto(
            "lookup",
            "ˈlu\u0307k-ˌəp",
            "en",
            new List<WordDefinitionDto>
            {
                new("noun",
                    "-",
                    "A procedure in which a table of values stored in a computer is searched until a specified value is found.")
            });
        var addedWord = await AddWord(lookupWord);
        Assert.NotNull(addedWord);
        Assert.Equivalent(lookupWord, addedWord);
    }

    [Fact]
    public async Task AddWord_ReturnHttpBadRequest()
    {
        var emptyWord = new WordDto(
            "",
            null,
            null,
            new List<WordDefinitionDto>()
        );
        var responseMessage = await _client.PostAsync("word-dictionary", JsonContent.Create(emptyWord));
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateWord_ReturnWord()
    {
        var watchWord = new WordDto(
            "watch",
            "ˈwȯch",
            "en",
            new List<WordDefinitionDto>
            {
                new("verb",
                    "-",
                    "to keep vigil as a devotional exercise"
                ),
                new("verb",
                    "-",
                    "to be attentive or vigilant"
                )
            }
        );

        var addedWord = await AddWord(watchWord);
        Assert.NotNull(addedWord);
        addedWord.Definitions.Add(new WordDefinitionDto(
            "noun",
            "-",
            "the act of keeping awake to guard, protect, or attend"
        ));
        addedWord.Definitions.Add(new WordDefinitionDto(
            "noun",
            "-",
            "any of the definite divisions of the night made by ancient peoples"
        ));
        
        var responseMessage = await _client.PutAsync($"{RequestUri}/{addedWord.Word}", JsonContent.Create(addedWord));
        var contentStream = await responseMessage.Content.ReadAsStreamAsync();
        var updatedWord = await JsonSerializer.DeserializeAsync<WordDto>(contentStream, _jsonSerializerOptions);
        Assert.NotNull(updatedWord);
        Assert.Equivalent(addedWord, updatedWord);
    }

    [Fact]
    public async Task UpdateWord_ReturnHttpNotFound()
    {
        var notExistentWord = new WordDto(
            "come on",
            null,
            null,
            new List<WordDefinitionDto>()
        );
        var responseMessage = await _client.PutAsync(
            $"{RequestUri}/{notExistentWord.Word}",
            JsonContent.Create(notExistentWord)
        );
        Assert.Equal(HttpStatusCode.NotFound, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteWord_ReturnHttpOk()
    {
        var someWord = new WordDto(
            "some",
            "ˈsəm",
            "en",
            new List<WordDefinitionDto>
            {
                new("noun", "-", "being an unknown, undetermined, or unspecified unit or thing"),
                new("pronoun", "-", "one indeterminate quantity, portion, or number as distinguished from the rest")
            }
        );
        var addedWord = await AddWord(someWord);
        Assert.NotNull(addedWord);
        var responseMessage = await _client.DeleteAsync($"{RequestUri}/{addedWord.Word}");
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }
    
    [Fact]
    public async Task DeleteWord_ReturnHttpNotFound()
    {
        var anotherWord = new WordDto(
            "another",
            "",
            "en",
            new List<WordDefinitionDto>()
        );
        var responseMessage = await _client.DeleteAsync($"{RequestUri}/{anotherWord.Word}");
        Assert.Equal(HttpStatusCode.NotFound, responseMessage.StatusCode);
    }
    
    private async Task<WordDto?> AddWord(WordDto word)
    {
        var responseMessage = await _client.PostAsync(RequestUri, JsonContent.Create(word));
        var contentStream = await responseMessage.Content.ReadAsStreamAsync();
        var addedWord = await JsonSerializer.DeserializeAsync<WordDto>(contentStream, _jsonSerializerOptions);
        return addedWord;
    }
}