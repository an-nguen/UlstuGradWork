using BookManager.Application.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace BookManager.Tests;

public class WebTestAppFactory<TProgram> : WebApplicationFactory<TProgram>
    where TProgram : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var assembly = typeof(Program).Assembly;
            services.AddControllers().AddApplicationPart(assembly);
            RemoveAppDbContext(services);
            AddTestDbContext(services);
        });
    }

    private static void AddTestDbContext(IServiceCollection services)
    {
        services.AddDbContextFactory<AppDbContext>(options =>
            options.UseNpgsql(Constants.TestDbConnStr, o => o.UseNodaTime())
                .UseSnakeCaseNamingConvention()
        );
    }

    private static void RemoveAppDbContext(IServiceCollection services)
    {
        var dbContextDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>))
                                  ?? throw new Exception("DbContext descriptor not found");
        services.Remove(dbContextDescriptor);
    }
}