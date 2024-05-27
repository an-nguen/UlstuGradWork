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
        await AddBookDocumentAsync(Constants.TestFilepath);
        var response = await _client.GetAsync($"{RequestUri}?pageNumber=1&pageSize=10");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var books = await JsonSerializer.DeserializeAsync<PageDto<BookDto>>(await response.Content.ReadAsStreamAsync(), _jsonSerializerOptions);
        Assert.NotNull(books);
        Assert.NotEmpty(books.Items);
        apiFixture.Cleanup();
    }

    [Fact]
    public async Task AddBook_ReturnsBook()
    {
        var bookDto = await AddBookDocumentAsync(Constants.TestFilepath);
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
        var bookDto = await AddBookDocumentAsync(Constants.TestFilepath);
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
        var bookDto = await AddBookDocumentAsync(Constants.TestFilepath);
        Assert.NotNull(bookDto);
        bookDto.DocumentDetails.Title = expectedTitle;
        bookDto.DocumentDetails.Description = expectedDescription;
        bookDto.DocumentDetails.Isbn = expectedIsbn;
        bookDto.DocumentDetails.PublisherName = expectedPublisherName;
        var response = await _client.PutAsync($"{RequestUri}/{bookDto.DocumentDetails.Id}", JsonContent.Create(bookDto.DocumentDetails));
        var modifiedBookDto = await JsonSerializer.DeserializeAsync<BookDto>(await response.Content.ReadAsStreamAsync(), _jsonSerializerOptions);
        Assert.Equivalent(bookDto, modifiedBookDto);
        apiFixture.Cleanup();
    }

    [Fact]
    public async Task DeleteBook_ReturnsHttpOk()
    {
        var bookDto = await AddBookDocumentAsync(Constants.TestFilepath);
        Assert.NotNull(bookDto);
        var response = await _client.DeleteAsync($"books/{bookDto.DocumentDetails.Id}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private static async Task<string> GetHash(string filePath)
    {
        var hasher = Hasher.New();
        hasher.Update(await File.ReadAllBytesAsync(filePath));
        return hasher.Finalize().ToString();
    }

    private async Task<BookDto?> AddBookDocumentAsync(string filepath)
    {
        var formData = new MultipartFormDataContent();
        var bookMetadata = new BookMetadataDto
        {
            Filename = Path.GetFileName(filepath),
            FileType = BookFileType.Pdf,
            FileSizeInBytes = new FileInfo(filepath).Length,
            Title = "PDF Specification"
        };
        var binaryContent = new StreamContent(File.OpenRead(filepath));
        formData.Add(JsonContent.Create(bookMetadata), "bookMetadata");
        formData.Add(binaryContent, "file", Path.GetFileName(filepath));
        var response = await _client.PostAsync("/books", formData);
        if (response.StatusCode != HttpStatusCode.OK)
        {
            throw new Exception("Failed to add book!");
        }
        return await JsonSerializer.DeserializeAsync<BookDto>(await response.Content.ReadAsStreamAsync(), _jsonSerializerOptions);
    }
}