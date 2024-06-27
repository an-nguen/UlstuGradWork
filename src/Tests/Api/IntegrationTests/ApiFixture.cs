using System.Net.Http.Headers;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces;
using BookManager.Application.Common.Interfaces.Services;
using BookManager.Application.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using ServiceProviderServiceExtensions = Microsoft.Extensions.DependencyInjection.ServiceProviderServiceExtensions;

namespace BookManager.Tests.Api.IntegrationTests;

public class ApiFixture : IDisposable
{
    private readonly WebTestAppFactory<Program> _factory;

    public ApiFixture()
    {
        _factory = new WebTestAppFactory<Program>();
        AddUser(Constants.SomeUserName, Constants.SomeUserPinCode);
        AddUser(Constants.AnotherUserName, Constants.AnotherUserPinCode);
    }

    public void Dispose()
    {
        GC.SuppressFinalize(this);
        using var scope = ServiceProviderServiceExtensions.CreateScope(_factory.Services);
        var dbContext = ServiceProviderServiceExtensions.GetRequiredService<AppDbContext>(scope.ServiceProvider);
        dbContext.Database.EnsureDeleted();
        _factory.Dispose();
    }

    public HttpClient CreateClient()
    {
        return _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
        });
    }

    public HttpClient CreateAuthenticatedClient(string username, string pinCode)
    {
        using var scope = ServiceProviderServiceExtensions.CreateScope(_factory.Services);
        var authService = ServiceProviderServiceExtensions.GetRequiredService<IAuthenticationService>(scope.ServiceProvider);
        var token = authService.SignIn(new AuthenticationRequestDto(username, pinCode))
            .Result
            .AccessToken!;
        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
        });
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    public void Cleanup()
    {
        using var scope = ServiceProviderServiceExtensions.CreateScope(_factory.Services);
        var dbContext = ServiceProviderServiceExtensions.GetRequiredService<AppDbContext>(scope.ServiceProvider);
        dbContext.Books.ExecuteDelete();
        dbContext.BookTexts.ExecuteDelete();
        dbContext.DictionaryWords.ExecuteDelete();
    }

    private UserDto? AddUser(string username, string pinCode)
    {
        using var scope = ServiceProviderServiceExtensions.CreateScope(_factory.Services);
        var userService = ServiceProviderServiceExtensions.GetRequiredService<IUserService>(scope.ServiceProvider);
        if (userService.GetUserByNameAsync(username).Result != null) return null;
        var user = userService.CreateUserAsync(new UserAddRequest(username, pinCode)).Result;
        Console.WriteLine($"The user {user.Name} added.");
        return user;
    }
}

[CollectionDefinition("Api collection")]
public class ApiFixtureCollection : ICollectionFixture<ApiFixture>;