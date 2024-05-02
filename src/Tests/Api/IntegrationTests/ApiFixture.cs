using BookManager.Application.Persistence;
using Grpc.Net.Client;
using Microsoft.EntityFrameworkCore;
using ServiceProviderServiceExtensions = Microsoft.Extensions.DependencyInjection.ServiceProviderServiceExtensions;

namespace BookManager.Tests.Api.IntegrationTests;

public class ApiFixture : IDisposable
{
    private readonly WebTestAppFactory<Program> _factory;
    private GrpcChannel? _channel;

    public ApiFixture()
    {
        _factory = new WebTestAppFactory<Program>();
        InitDatabase();
    }

    public GrpcChannel Channel => _channel ??= CreateChannel();

    public void Dispose()
    {
        GC.SuppressFinalize(this);
        Cleanup();
        _factory.Dispose();
    }

    private void InitDatabase()
    {
        using var scope = ServiceProviderServiceExtensions.CreateScope(_factory.Services);
        var dbContext = ServiceProviderServiceExtensions.GetRequiredService<AppDbContext>(scope.ServiceProvider);
        dbContext.Database.EnsureDeleted();
        dbContext.Database.EnsureCreated();
    }

    public void Cleanup()
    {
        using var scope = ServiceProviderServiceExtensions.CreateScope(_factory.Services);
        var dbContext = ServiceProviderServiceExtensions.GetRequiredService<AppDbContext>(scope.ServiceProvider);
        dbContext.BookDocuments.ExecuteDelete();
        dbContext.BookDocumentsTexts.ExecuteDelete();
    }

    private GrpcChannel CreateChannel()
    {
        return GrpcChannel.ForAddress("http://localhost", new GrpcChannelOptions
        {
            HttpClient = _factory.CreateClient()
        });
    }
}

[CollectionDefinition("Api collection")]
public class ApiFixtureCollection : ICollectionFixture<ApiFixture>;