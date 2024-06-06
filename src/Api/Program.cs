using BookManager.Api.Extensions;
using BookManager.Api.Hubs;
using BookManager.Api.Services;
using BookManager.Application;
using BookManager.Application.Common;
using BookManager.Application.Notification;

string[] DevOrigins = ["https://localhost:4200", "http://localhost:4200"];

var builder = WebApplication.CreateBuilder();

builder.Services
    .Configure<FileStorageOptions>(builder.Configuration.GetSection(FileStorageOptions.FileStorage))
    .ConfigureDataPersistence(builder.Configuration)
    .AddApplicationServices(builder.Configuration);

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer()
    .AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy
        .WithOrigins(
            allowedOrigins ?? DevOrigins
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()
    );
});
builder.Services.AddYandexCloudSdk(builder.Configuration);
builder.Services.AddTokenBasedSecurity(builder.Configuration);
builder.Services.AddSingleton<INotificationService, PushNotificationService>();
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = Constants.Default.MaxFileSize;
});

var app = builder.Build();

app.DbMigrate();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseWebSockets();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
app.MapHub<NotificationHub>("/notification");

app.Run();

// For tests
public abstract partial class Program;