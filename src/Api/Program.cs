using BookManager.Application;

var builder = WebApplication.CreateBuilder();

builder.Services.Configure<FileStorageOptions>(builder.Configuration.GetSection(FileStorageOptions.FileStorage));
builder.Services.ConfigureDataPersistence(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200").WithHeaders("content-type");
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseHttpsRedirection();

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();

// For tests
public abstract partial class Program;