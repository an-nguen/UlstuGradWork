using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using BookManager.Application.Common.DTOs;

namespace BookManager.Tests.Api.IntegrationTests;

[Collection("Api collection")]
public class UserTests(ApiFixture apiFixture)
{
    private readonly HttpClient _client = apiFixture.CreateClient();
    private readonly HttpClient _authClient = apiFixture.CreateAuthenticatedClient(Constants.SomeUserName, Constants.SomeUserPinCode);
    private readonly JsonSerializerOptions _jsonSerializerOptions = new(JsonSerializerDefaults.Web);

    [Fact]
    public async Task GetUsers_ReturnsUserList()
    {
        await CreateUserAsync("random_user0", "1234");
        await CreateUserAsync("random_user1", "1234");
        var responseMessage = await _client.GetAsync("/users");
        var userList = await JsonSerializer.DeserializeAsync<IEnumerable<UserDto>>(
            await responseMessage.Content.ReadAsStreamAsync(),
            _jsonSerializerOptions
        );
        Assert.NotNull(userList);
        Assert.NotEmpty(userList);
    }

    [Fact]
    public async Task CreateUser_ReturnsUser()
    {
        const string expectedUsername = "test_creation_user";
        var createdUser = await CreateUserAsync(expectedUsername, "1234");
        Assert.NotNull(createdUser);
        Assert.Equal(expectedUsername, createdUser.Name);
    }

    [Fact]
    public async Task SignIn_ReturnsToken()
    {
        const string username = "test_sign_in_user";
        const string pinCode = "1234";
        await CreateUserAsync(username, pinCode);
        var authResponse = await SignInAsync(username, pinCode);
        Assert.NotNull(authResponse);
        Assert.False(string.IsNullOrEmpty(authResponse.AccessToken));
    }

    [Fact]
    public async Task UpdateUser_ReturnsUser()
    {
        const string username = "test_update_user";
        const string pinCode = "1234";
        const string updatedPinCode = "4321";
        var createdUser = await CreateUserAsync(username, pinCode);
        Assert.NotNull(createdUser);
        var authResponse = await SignInAsync(username, pinCode);
        Assert.NotNull(authResponse);
        var authenticatedClient = CreateAuthenticatedClient(authResponse);
        var updateRequest = new UserUpdateRequest(pinCode, updatedPinCode);
        var responseMessage =
            await authenticatedClient.PutAsync($"/users/{createdUser.Id}", JsonContent.Create(updateRequest));
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        var updatedUser = await JsonSerializer.DeserializeAsync<UserDto>(
            await responseMessage.Content.ReadAsStreamAsync(),
            _jsonSerializerOptions
        );
        Assert.NotNull(updatedUser);
        Assert.Equal(username, updatedUser.Name);
        authResponse = await SignInAsync(username, updatedPinCode);
        Assert.NotNull(authResponse);
        Assert.False(string.IsNullOrEmpty(authResponse.AccessToken));
    }

    [Fact]
    public async Task UpdateUser_ReturnsHttpForbidden()
    {
        const string username = "test_update_forbid_user";
        const string pinCode = "1234";
        const string updatedPinCode = "4321";
        var createdUser = await CreateUserAsync(username, pinCode);
        Assert.NotNull(createdUser);
        var updateRequest = new UserUpdateRequest(pinCode, updatedPinCode);
        // Send update request to try to update PIN-code by another user
        var responseMessage =
            await _authClient.PutAsync($"/users/{createdUser.Id}", JsonContent.Create(updateRequest));
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteUser_ReturnsHttpOk()
    {
        const string username = "test_delete_user";
        const string pinCode = "1234";
        var createdUser = await CreateUserAsync(username, pinCode);
        Assert.NotNull(createdUser);
        var authResponse = await SignInAsync(username, pinCode);
        var authenticatedClient = CreateAuthenticatedClient(authResponse);
        var requestBody = new UserDeleteRequest(pinCode);
        var request = new HttpRequestMessage()
        {
            Content = JsonContent.Create(requestBody),
            Method = HttpMethod.Delete,
            RequestUri = new Uri($"{authenticatedClient.BaseAddress}users/{createdUser.Id}"),
        };
        request.Headers.Authorization = authenticatedClient.DefaultRequestHeaders.Authorization;
        var responseMessage =
            await authenticatedClient.SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteUser_ReturnsHttpForbidden()
    {
        const string username = "test_delete_forbid_user";
        const string pinCode = "1234";
        var createdUser = await CreateUserAsync(username, pinCode);
        Assert.NotNull(createdUser);
        var requestBody = new UserDeleteRequest(pinCode);
        var request = new HttpRequestMessage()
        {
            Content = JsonContent.Create(requestBody),
            Method = HttpMethod.Delete,
            RequestUri = new Uri($"{_authClient.BaseAddress}users/{createdUser.Id}"),
        };
        request.Headers.Authorization = _authClient.DefaultRequestHeaders.Authorization;
        var responseMessage = await _authClient.SendAsync(request);
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage.StatusCode);
    }

    private HttpClient CreateAuthenticatedClient(AuthenticationResponseDto? authResponse)
    {
        var authenticatedClient = apiFixture.CreateClient();
        Assert.NotNull(authResponse);
        authenticatedClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", authResponse.AccessToken);
        return authenticatedClient;
    }

    private async Task<AuthenticationResponseDto?> SignInAsync(string name, string pinCode)
    {
        var signInRequest = new AuthenticationRequestDto(name, pinCode);
        var responseMessage = await _client.PostAsync("/auth/sign-in", JsonContent.Create(signInRequest));
        return await JsonSerializer.DeserializeAsync<AuthenticationResponseDto>(
            await responseMessage.Content.ReadAsStreamAsync(),
            _jsonSerializerOptions
        );
    }

    private async Task<UserDto?> CreateUserAsync(string name, string pinCode)
    {
        var request = new UserAddRequest(name, pinCode);
        var responseMessage = await _client.PostAsync("/users", JsonContent.Create(request));
        var createdUser = await JsonSerializer.DeserializeAsync<UserDto>(
            await responseMessage.Content.ReadAsStreamAsync(),
            _jsonSerializerOptions
        );
        return createdUser;
    }
}