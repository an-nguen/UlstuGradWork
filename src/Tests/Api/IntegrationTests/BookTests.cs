using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Blake3;
using BookManager.Application.Common.DTOs;
using BookManager.Domain.Enums;
using File = System.IO.File;

namespace BookManager.Tests.Api.IntegrationTests;

[Collection("Api collection")]
public class BookControllerTests(ApiFixture apiFixture)
{
    private const string RequestUri = "books";
    private readonly HttpClient _client = apiFixture.CreateAuthenticatedClient();

    private readonly JsonSerializerOptions _jsonSerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    [Fact]
    public async Task GetBooks_ReturnsBookList()
    {
        await AddBookAsync(_client, _jsonSerializerOptions, Constants.TestFilepath);
        var response = await _client.GetAsync($"{RequestUri}?pageNumber=1&pageSize=10");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var books = await JsonSerializer.DeserializeAsync<PageDto<BookDto>>(await response.Content.ReadAsStreamAsync(),
            _jsonSerializerOptions);
        Assert.NotNull(books);
        Assert.NotEmpty(books.Items);
        apiFixture.Cleanup();
    }

    [Fact]
    public async Task AddBook_ReturnsBook()
    {
        var bookDto = await AddBookAsync(_client, _jsonSerializerOptions, Constants.TestFilepath, Constants.TestFileTitle);
        var fileInfo = new FileInfo(Constants.TestFilepath);
        Assert.NotNull(bookDto);
        Assert.Equal(fileInfo.Length, bookDto.FileMetadata.Size);
        Assert.Equal(BookFileType.Pdf, bookDto.FileMetadata.Type);
        Assert.Equal(Constants.TestFileTitle, bookDto.DocumentDetails.Title);
        apiFixture.Cleanup();
    }

    [Fact]
    public async Task DownloadBook_ReturnsFile()
    {
        const string filenameOfTmp = "temp.pdf";
        var bookDto = await AddBookAsync(_client, _jsonSerializerOptions, Constants.TestFilepath);
        Assert.NotNull(bookDto);
        var expectedHash = await GetHash(Constants.TestFilepath);
        await using var stream = await _client.GetStreamAsync($"{RequestUri}/download/{bookDto.DocumentDetails.Id}");
        await using (var fs = new FileStream(filenameOfTmp, FileMode.Create))
        {
            await stream.CopyToAsync(fs);
        }

        Assert.Equal(expectedHash, await GetHash(filenameOfTmp));
        File.Delete(filenameOfTmp);
        apiFixture.Cleanup();
    }

    [Fact]
    public async Task UpdateBookDetails_ReturnsBook()
    {
        const string expectedTitle = "Another title";
        const string expectedDescription = "Some description text";
        const string expectedIsbn = "isbn";
        const string expectedPublisherName = "noname";
        var bookDto = await AddBookAsync(_client, _jsonSerializerOptions, Constants.TestFilepath);
        Assert.NotNull(bookDto);
        bookDto.DocumentDetails.Title = expectedTitle;
        bookDto.DocumentDetails.Description = expectedDescription;
        bookDto.DocumentDetails.Isbn = expectedIsbn;
        bookDto.DocumentDetails.PublisherName = expectedPublisherName;
        var response = await _client.PutAsync($"{RequestUri}/{bookDto.DocumentDetails.Id}",
            JsonContent.Create(bookDto.DocumentDetails)
        );
        var modifiedBookDto = await JsonSerializer.DeserializeAsync<BookDto>(
            await response.Content.ReadAsStreamAsync(),
            _jsonSerializerOptions
        );
        Assert.Equivalent(bookDto, modifiedBookDto);
        apiFixture.Cleanup();
    }

    [Fact]
    public async Task DeleteBook_ReturnsHttpOk()
    {
        var bookDto = await AddBookAsync(_client, _jsonSerializerOptions, Constants.TestFilepath);
        Assert.NotNull(bookDto);
        var response = await _client.DeleteAsync($"books/{bookDto.DocumentDetails.Id}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateTicket_ReturnsTicketDto()
    {
        var response = await _client.PostAsync($"{RequestUri}/tickets", null);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var ticketDto = JsonSerializer.Deserialize<TicketDto>(response.Content.ReadAsStream(), _jsonSerializerOptions);
        Assert.NotNull(ticketDto);
    }

    [Fact]
    public async Task UpdateTotalReadingTime_ReturnsHttpOk()
    {
        // * Add book
        var bookDto = await AddBookAsync(_client, _jsonSerializerOptions, Constants.TestFilepath);
        Assert.NotNull(bookDto);
        // * Get ticket for updating total reading time
        var response = await _client.PostAsync($"{RequestUri}/tickets", null);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var ticketDto = JsonSerializer.Deserialize<TicketDto>(response.Content.ReadAsStream(), _jsonSerializerOptions);
        Assert.NotNull(ticketDto);
        // * Update total reading time
        var updateTotalReadingTimeRequest = new TotalTimeUpdateRequestDto()
        {
            TicketId = ticketDto.Id,
            Seconds = 360,
        };
        response = await _client.PostAsync($"{RequestUri}/{bookDto.DocumentDetails.Id}/update-total-time", JsonContent.Create(updateTotalReadingTimeRequest));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        // * Find book
        response = await _client.GetAsync($"{RequestUri}/{bookDto.DocumentDetails.Id}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        bookDto = JsonSerializer.Deserialize<BookDto>(response.Content.ReadAsStream(), _jsonSerializerOptions);
        Assert.NotNull(bookDto);
        Assert.NotNull(bookDto.Stats);
        Assert.Equal(360, bookDto.Stats.TotalReadingTime);
    }

    [Fact]
    public async Task UpdateLastViewedPage()
    {
        // * Add book
        var bookDto = await AddBookAsync(_client, _jsonSerializerOptions, Constants.TestFilepath);
        Assert.NotNull(bookDto);
        // * Update last viewed page
        var updateLastViewedPageRequest = new LastViewedPageUpdateRequest(10);
        var response = await _client.PostAsync($"{RequestUri}/{bookDto.DocumentDetails.Id}/last-viewed-page", JsonContent.Create(updateLastViewedPageRequest));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    public static async Task<BookDto?> AddBookAsync(
        HttpClient client,
        JsonSerializerOptions serializerOptions,
        string filepath,
        string? bookTitle = null
    )
    {
        var formData = new MultipartFormDataContent();
        var bookMetadata = new BookMetadataDto
        {
            Filename = Path.GetFileName(filepath),
            FileType = BookFileType.Pdf,
            FileSizeInBytes = new FileInfo(filepath).Length,
            Title = bookTitle ?? Path.GetFileName(filepath)
        };
        var binaryContent = new StreamContent(File.OpenRead(filepath));
        formData.Add(JsonContent.Create(bookMetadata), "bookMetadata");
        formData.Add(binaryContent, "file", Path.GetFileName(filepath));
        var response = await client.PostAsync("/books", formData);
        if (response.StatusCode != HttpStatusCode.OK)
        {
            throw new Exception("Failed to add book!");
        }

        return await JsonSerializer.DeserializeAsync<BookDto>(await response.Content.ReadAsStreamAsync(),
            serializerOptions);
    }

    private static async Task<string> GetHash(string filePath)
    {
        var hasher = Hasher.New();
        hasher.Update(await File.ReadAllBytesAsync(filePath));
        return hasher.Finalize().ToString();
    }
}