using BookManager.Application;
using Microsoft.Extensions.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder();

builder.Services.Configure<FileStorageOptions>(builder.Configuration.GetSection(FileStorageOptions.FileStorage));
builder.Services.ConfigureDataPersistence(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddControllers();
builder.Services.AddGrpc(o => o.EnableDetailedErrors = true);
builder.Services.AddGrpcHealthChecks()
    .AddCheck("All", () => HealthCheckResult.Healthy());
builder.Services.AddGrpcReflection();

var app = builder.Build();

app.MapDefaultControllerRoute();
app.Run();

// For tests
public abstract partial class Program;