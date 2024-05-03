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
    options.AddDefaultPolicy(policy => policy.WithOrigins("http://localhost:4200").WithHeaders("content-type"));
});
builder.AddTokenBasedSecurity();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// For tests
public abstract partial class Program;