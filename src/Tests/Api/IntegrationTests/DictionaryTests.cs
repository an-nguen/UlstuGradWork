using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using BookManager.Application.Common.DTOs;

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
        await AddWordAsync(functionWord, _client);
        await AddWordAsync(functionKeyWord, _client);
        const string requestWord = "function";
        var response = await _client.GetAsync($"{RequestUri}/{requestWord}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var words = JsonSerializer.Deserialize<IEnumerable<WordDto>>(response.Content.ReadAsStream(), _jsonSerializerOptions);
        Assert.NotNull(words);
        Assert.NotEmpty(words);
    }

    [Fact]
    public async Task AddWord_ReturnWord()
    {
        var lookupWord = new WordDto
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
        var addedWord = await AddWordAsync(lookupWord, _client);
        Assert.NotNull(addedWord);
        Assert.Equivalent(lookupWord, addedWord);
    }

    [Fact]
    public async Task AddWord_ReturnHttpBadRequest()
    {
        var emptyWord = new WordDto
        {
            Word = "",
            Transcription = null,
            LanguageCode = null,
            Stems = null,
            Definitions = []
        };
        var responseMessage = await _client.PostAsync("word-dictionary", JsonContent.Create(emptyWord));
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateWord_ReturnWord()
    {
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

        var addedWord = await AddWordAsync(watchWord, _client);
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
    public async Task DeleteWord_ReturnHttpForbidden()
    {
        var wordAddedByOneUser = await AddWordAsync(
            new WordDto
            {
                Word = "steal",
                Definitions = [new("verb", "-", "to take something without the permission or knowledge of the owner and keep it")]
            },
            _client
        );
        Assert.NotNull(wordAddedByOneUser);
        var url = $"{RequestUri}/{wordAddedByOneUser.Word}";
        var response = await _anotherClient.DeleteAsync(url);
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateWord_ReturnHttpNotFound()
    {
        var notExistentWord = new WordDto
        {
            Word = "come on",
            Transcription = null,
            LanguageCode = null,
            Stems = null,
            Definitions = []
        };
        var responseMessage = await _client.PutAsync(
            $"{RequestUri}/{notExistentWord.Word}",
            JsonContent.Create(notExistentWord)
        );
        Assert.Equal(HttpStatusCode.NotFound, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteWord_ReturnHttpOk()
    {
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
        var addedWord = await AddWordAsync(someWord, _client);
        Assert.NotNull(addedWord);
        var responseMessage = await _client.DeleteAsync($"{RequestUri}/{addedWord.Word}");
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateWord_ReturnHttpForbidden()
    {
        var wordAddedByOneUser = await AddWordAsync(
            new WordDto
            {
                Word = "pass away",
                Definitions = [new("verb", "-", "to stop living")]
            },
            _client
        );
        Assert.NotNull(wordAddedByOneUser);
        var url = $"{RequestUri}/{wordAddedByOneUser.Word}";
        var modifiedWord = wordAddedByOneUser;
        modifiedWord.Transcription = "pɑːs əˈweɪ";
        var response = await _anotherClient.PutAsync(url, JsonContent.Create(modifiedWord));
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task DeleteWord_ReturnHttpNotFound()
    {
        var anotherWord = new WordDto
        {
            Word = "another",
            Transcription = "",
            LanguageCode = "en",
            Stems = null,
            Definitions = []
        };
        var responseMessage = await _client.DeleteAsync($"{RequestUri}/{anotherWord.Word}");
        Assert.Equal(HttpStatusCode.NotFound, responseMessage.StatusCode);
    }

    private async Task<WordDto?> AddWordAsync(WordDto word, HttpClient client)
    {
        var responseMessage = await client.PostAsync(RequestUri, JsonContent.Create(word));
        var contentStream = await responseMessage.Content.ReadAsStreamAsync();
        var addedWord = await JsonSerializer.DeserializeAsync<WordDto>(contentStream, _jsonSerializerOptions);
        return addedWord;
    }
}