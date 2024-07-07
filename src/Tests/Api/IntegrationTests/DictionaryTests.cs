using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using BookManager.Application.Common.DTOs;
using FluentAssertions;

namespace BookManager.Tests.Api.IntegrationTests;

[Collection("Api collection")]
public class DictionaryTests(ApiFixture apiFixture)
{
    private const string RequestUri = "word-dictionary";
    private readonly HttpClient _client = apiFixture.CreateAuthenticatedClient(Constants.SomeUserName, Constants.SomeUserPinCode);
    private readonly HttpClient _anotherClient = apiFixture.CreateAuthenticatedClient(Constants.AnotherUserName, Constants.AnotherUserPinCode);
    private readonly JsonSerializerOptions _jsonSerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    [Fact]
    public async Task FindWord_ReturnList()
    {
        // Arrange
        var functionWord = new WordDto
        {
            Word = "function",
            Transcription = "ˈfəŋ(k)-shən",
            Stems = [
                "function",
                "functionless",
                "functions",
                "functioning",
                "functioned",
            ],
            Definitions = [
                new ("noun", "", "professional or official position : occupation"),
                new ("noun", "", "the action for which a person or thing is specially fitted or used or for which a thing exists : purpose"),
                new ("noun", "", "any of a group of related actions contributing to a larger action; especially : the normal and specific contribution of a bodily part to the economy of a living organism"),
                new ("verb", "", "to have a function : serve"),
                new ("verb", "", "to carry on a function or be in action : operate"),
            ]
        };
        var functionKeyWord = new WordDto
        {
            Word = "function key",
            Stems = [
                "function key",
                "function keys"
            ],
            Definitions = [
                new ("noun", "", "any of a set of keys on a computer keyboard that have or can be programmed to have special functions")
            ]
        };
        var expectedStatusCode = HttpStatusCode.OK;
        // Act
        await AddWordAsync(functionWord, _client);
        await AddWordAsync(functionKeyWord, _client);
        const string requestWord = "function";
        var response = await _client.GetAsync($"{RequestUri}/{requestWord}");
        // Assert
        response.StatusCode.Should().Be(expectedStatusCode);
        var actualAddedWords = JsonSerializer.Deserialize<IEnumerable<WordDto>>(response.Content.ReadAsStream(), _jsonSerializerOptions);
        actualAddedWords.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task AddWord_ReturnWord()
    {
        // Arrange
        var expectedLookupWord = new WordDto
        {
            Word = "lookup",
            Transcription = "ˈlu\u0307k-ˌəp",
            LanguageCode = "en",
            Stems = [
                "look-up",
                "look-ups",
                "lookup",
                "lookups"
            ],
            Definitions = [
                new("noun",
                    "-",
                    "A procedure in which a table of values stored in a computer is searched until a specified value is found.")
            ]
        };
        // Act
        var actualAddedWord = await AddWordAsync(expectedLookupWord, _client);
        // Assert
        actualAddedWord.Should().NotBeNull()
            .And
            .BeEquivalentTo(expectedLookupWord, options => options
                .Excluding(w => w.Id)
                .Excluding(w => w.CreatedAt)
                .Excluding(w => w.UpdatedAt)
                .Excluding(w => w.Username)
            );
    }

    [Fact]
    public async Task AddWord_ReturnHttpBadRequest()
    {
        // Arrange
        var emptyWord = new WordDto
        {
            Word = "",
            Transcription = null,
            LanguageCode = null,
            Stems = null,
            Definitions = []
        };
        var expectedStatusCode = HttpStatusCode.BadRequest;
        // Act
        var actualResponseMessage = await _client.PostAsync("word-dictionary", JsonContent.Create(emptyWord));
        // Assert
        actualResponseMessage.StatusCode.Should().Be(expectedStatusCode);
    }

    [Fact]
    public async Task UpdateWord_ReturnWord()
    {
        // Arrange
        var watchWord = new WordDto
        {
            Word = "watch",
            Transcription = "ˈwȯch",
            LanguageCode = "en",
            Stems = [],
            Definitions = [
                new("verb",
                    "-",
                    "to keep vigil as a devotional exercise"
                ),
                new("verb",
                    "-",
                    "to be attentive or vigilant"
                )
            ]
        };
        // Act
        var addedWord = await AddWordAsync(watchWord, _client);
        addedWord.Should().NotBeNull();
        addedWord!.Definitions.Add(new WordDefinitionDto(
            "noun",
            "-",
            "the act of keeping awake to guard, protect, or attend"
        ));
        addedWord!.Definitions.Add(new WordDefinitionDto(
            "noun",
            "-",
            "any of the definite divisions of the night made by ancient peoples"
        ));

        var responseMessage = await _client.PutAsync($"{RequestUri}/{addedWord.Id}", JsonContent.Create(addedWord));
        var contentStream = await responseMessage.Content.ReadAsStreamAsync();
        var actualUpdatedWord = JsonSerializer.Deserialize<WordDto>(contentStream, _jsonSerializerOptions);
        // Assert
        actualUpdatedWord.Should().NotBeNull()
            .And
            .BeEquivalentTo(addedWord, options => options
                .Excluding(w => w.Id)
                .Excluding(w => w.CreatedAt)
                .Excluding(w => w.UpdatedAt)
                .Excluding(w => w.Username)
            );
    }

    [Fact]
    public async Task DeleteWord_ReturnHttpForbidden()
    {
        // Arrange
        var wordAddedByOneUser = await AddWordAsync(
            new WordDto
            {
                Word = "steal",
                Definitions = [new("verb", "-", "to take something without the permission or knowledge of the owner and keep it")]
            },
            _client
        );
        var expectedStatusCode = HttpStatusCode.Forbidden;
        // Act
        var url = $"{RequestUri}/{wordAddedByOneUser!.Id}";
        var response = await _anotherClient.DeleteAsync(url);
        // Assert
        response.StatusCode.Should().Be(expectedStatusCode);
    }

    [Fact]
    public async Task UpdateWord_ReturnHttpNotFound()
    {
        // Arrange
        var notExistentWord = new WordDto
        {
            Word = "come on",
            Transcription = null,
            LanguageCode = null,
            Stems = null,
            Definitions = []
        };
        var expectedStatusCode = HttpStatusCode.NotFound;
        // Act
        var responseMessage = await _client.PutAsync(
            $"{RequestUri}/{notExistentWord.Id}",
            JsonContent.Create(notExistentWord)
        );
        responseMessage.StatusCode.Should().Be(expectedStatusCode);
    }

    [Fact]
    public async Task DeleteWord_ReturnHttpOk()
    {
        // Arrange
        var someWord = new WordDto
        {
            Word = "some",
            Transcription = "ˈsəm",
            LanguageCode = "en",
            Stems = null,
            Definitions = [
                new("noun", "-", "being an unknown, undetermined, or unspecified unit or thing"),
                new("pronoun", "-", "one indeterminate quantity, portion, or number as distinguished from the rest")
            ]
        };
        var expectedStatusCode = HttpStatusCode.OK;
        // Act
        var addedWord = await AddWordAsync(someWord, _client);
        var responseMessage = await _client.DeleteAsync($"{RequestUri}/{addedWord!.Id}");
        // Assert
        responseMessage.StatusCode.Should().Be(expectedStatusCode);
    }

    [Fact]
    public async Task UpdateWord_ReturnHttpForbidden()
    {
        // Arrange
        var wordAddedByOneUser = await AddWordAsync(
            new WordDto
            {
                Word = "pass away",
                Definitions = [new("verb", "-", "to stop living")]
            },
            _client
        );
        var expectedStatusCode = HttpStatusCode.Forbidden;
        var url = $"{RequestUri}/{wordAddedByOneUser!.Id}";
        var modifiedWord = wordAddedByOneUser;
        modifiedWord.Transcription = "pɑːs əˈweɪ";
        // Act
        var actualResponse = await _anotherClient.PutAsync(url, JsonContent.Create(modifiedWord));
        // Assert
        actualResponse.StatusCode.Should().Be(expectedStatusCode);
    }

    [Fact]
    public async Task DeleteWord_ReturnHttpNotFound()
    {
        // Arrange
        var anotherWord = new WordDto
        {
            Word = "another",
            Transcription = "",
            LanguageCode = "en",
            Stems = null,
            Definitions = []
        };
        var expectedStatusCode = HttpStatusCode.NotFound;
        // Act
        var actualResponse = await _client.DeleteAsync($"{RequestUri}/{anotherWord.Id}");
        // Assert
        actualResponse.StatusCode.Should().Be(expectedStatusCode);
    }

    private async Task<WordDto?> AddWordAsync(WordDto word, HttpClient client)
    {
        var responseMessage = await client.PostAsync(RequestUri, JsonContent.Create(word));
        var contentStream = await responseMessage.Content.ReadAsStreamAsync();
        var addedWord = await JsonSerializer.DeserializeAsync<WordDto>(contentStream, _jsonSerializerOptions);
        return addedWord;
    }
}