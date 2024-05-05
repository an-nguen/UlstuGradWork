using BookManager.Application.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BookManager.Api.Extensions;

public static class DbMigrations
{
    public static WebApplication DbMigrate(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (context.Database.GetPendingMigrations().Any())
        {
            context.Database.Migrate();
        }

        return app;
    } 
}