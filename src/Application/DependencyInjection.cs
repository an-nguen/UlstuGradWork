using BookManager.Application.Common.Config;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces;
using BookManager.Application.Common.Interfaces.Services;
using BookManager.Application.Indexing;
using BookManager.Application.Notification;
using BookManager.Application.Persistence;
using BookManager.Application.Persistence.FileSystem;
using BookManager.Application.Services;
using BookManager.Application.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NodaTime;
using NodaTime.Serialization.SystemTextJson;
using Npgsql;
using Constants = BookManager.Application.Common.Constants;

namespace BookManager.Application;

public static class DependencyInjection
{
    public static IServiceCollection ConfigureDataPersistence(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var conStrBuilder = new NpgsqlConnectionStringBuilder(configuration.GetConnectionString("Main"))
        {
            Password = configuration["DbPassword"]
        };
        var connection = conStrBuilder.ConnectionString;
        services.AddDbContextFactory<AppDbContext>(options =>
            options.UseNpgsql(connection, o => o.UseNodaTime())
                .UseSnakeCaseNamingConvention());
        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());
        services.AddIdentityCore<User>(options =>
            {
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireDigit = true;
                options.Password.RequireNonAlphanumeric = false;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<AppDbContext>();

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<MerriamWebsterOptions>(configuration.GetSection(MerriamWebsterOptions.MerriamWebster));

        services.AddSingleton<IFileStorage, FileStorage>();
        services.AddSingleton<IIndexingTaskQueue>(_ => new IndexingTaskQueue(Constants.Default.IndexingQueueCapacity));
        services.ConfigureHttpJsonOptions(jsonOptions =>
        {
            jsonOptions.SerializerOptions.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
        });

        services.AddScoped<IBookService, BookService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ISearchService, SearchService>();
        services.AddScoped<IIndexingService, IndexingService>();
        services.AddScoped<IAuthenticationService, AuthenticationService>();
        services.AddScoped<IBookFileHandler, PdfBookFileHandler>();
        services.AddScoped<ITranslationService, YTranslationService>();
        services.AddScoped<ITextSummarizationService, YTextSummarizationService>();
        services.AddScoped<IWordDictionaryService, DictionaryService>();
        services.AddScoped<IBookCollectionService, BookCollectionService>();
        services.AddTransient<IThirdPartyDictionaryProvider, MerriamWebsterDictionaryProvider>();
        services.AddTransient<IThirdPartyDictionaryProvider, YAiDictionaryProvider>();

        services.AddScoped<IValidator<PageRequestDto>, PageRequestValidator>();
        services.AddScoped<IValidator<UserAddRequest>, UserAddRequestValidator>();
        services.AddScoped<IValidator<UserUpdateRequest>, UserUpdateRequestValidator>();
        services.AddScoped<IValidator<WordDto>, WordDtoValidator>();

        services.AddHttpClient<ITextSummarizationService, YTextSummarizationService>(httpClient =>
        {
            httpClient.BaseAddress = new Uri("https://llm.api.cloud.yandex.net");
        });
        services.AddHttpClient<YAiDictionaryProvider>();
        services.AddHttpClient<MerriamWebsterDictionaryProvider>();

        services.AddHostedService<IndexingHostedService>();

        return services;
    }
}