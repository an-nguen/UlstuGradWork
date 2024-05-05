﻿using System.Reflection;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces;
using BookManager.Application.Common.Interfaces.Services;
using BookManager.Application.Indexing;
using BookManager.Application.Persistence;
using BookManager.Application.Persistence.FileSystem;
using BookManager.Application.Services;
using BookManager.Application.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using Constants = BookManager.Application.Common.Constants;

namespace BookManager.Application;

public static class DependencyInjection
{
    public static IServiceCollection ConfigureDataPersistence(this IServiceCollection services,
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

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        services.AddSingleton<IFileStorage, FileStorage>();
        services.AddSingleton<IIndexingTaskQueue>(_ => new IndexingTaskQueue(Constants.Default.IndexingQueueCapacity));

        services.AddScoped<IBookService, BookService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ISearchService, SearchService>();
        services.AddScoped<IIndexingService, IndexingService>();
        services.AddScoped<IAuthenticationService, AuthenticationService>();
        services.AddScoped<IBookFileHandler, PdfBookFileHandler>();

        services.AddScoped<IValidator<UserAddRequest>, UserAddRequestValidator>();
        services.AddHostedService<IndexingHostedService>();

        return services;
    }
}