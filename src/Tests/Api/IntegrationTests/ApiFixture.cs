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
        AddUser();
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

    public HttpClient CreateAuthenticatedClient()
    {
        using var scope = ServiceProviderServiceExtensions.CreateScope(_factory.Services);
        var authService = ServiceProviderServiceExtensions.GetRequiredService<IAuthenticationService>(scope.ServiceProvider);
        var token = authService.SignIn(new AuthenticationRequestDto(Constants.UserName, Constants.UserPinCode))
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
    
    private void AddUser()
    {
        using var scope = ServiceProviderServiceExtensions.CreateScope(_factory.Services);
        var userService = ServiceProviderServiceExtensions.GetRequiredService<IUserService>(scope.ServiceProvider);
        var user = userService.CreateUser(new UserAddRequest
        {
            Name = Constants.UserName,
            PinCode = Constants.UserPinCode,
        }).Result;
        Console.WriteLine($"The user ${user.Name} created.");
    }
}

[CollectionDefinition("Api collection")]
public class ApiFixtureCollection : ICollectionFixture<ApiFixture>;