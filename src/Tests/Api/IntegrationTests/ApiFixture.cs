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
        InitDatabase();
    }

    public void Dispose()
    {
        GC.SuppressFinalize(this);
        Cleanup();
        _factory.Dispose();
    }

    public HttpClient CreateClient()
    {
        return _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
        });
    }

    public void Cleanup()
    {
        using var scope = ServiceProviderServiceExtensions.CreateScope(_factory.Services);
        var dbContext = ServiceProviderServiceExtensions.GetRequiredService<AppDbContext>(scope.ServiceProvider);
        dbContext.Books.ExecuteDelete();
        dbContext.BookTexts.ExecuteDelete();
    }

    private void InitDatabase()
    {
        using var scope = ServiceProviderServiceExtensions.CreateScope(_factory.Services);
        var dbContext = ServiceProviderServiceExtensions.GetRequiredService<AppDbContext>(scope.ServiceProvider);
        dbContext.Database.EnsureDeleted();
        dbContext.Database.EnsureCreated();
    }
}

[CollectionDefinition("Api collection")]
public class ApiFixtureCollection : ICollectionFixture<ApiFixture>;