using BookManager.Api.Extensions;
using BookManager.Application;

var builder = WebApplication.CreateBuilder();

builder.Services
    .Configure<FileStorageOptions>(builder.Configuration.GetSection(FileStorageOptions.FileStorage))
    .ConfigureDataPersistence(builder.Configuration)
    .AddApplicationServices();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer()
    .AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy
        .WithOrigins(
            "https://localhost:4200",
            "http://localhost:4200"
            )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()
    );
});
builder.AddTokenBasedSecurity();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// For tests
public abstract partial class Program;