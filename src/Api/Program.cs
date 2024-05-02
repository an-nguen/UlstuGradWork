using BookManager.Application;

var builder = WebApplication.CreateBuilder();

builder.Services.Configure<FileStorageOptions>(builder.Configuration.GetSection(FileStorageOptions.FileStorage));
builder.Services.ConfigureDataPersistence(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

// For tests
public abstract partial class Program;