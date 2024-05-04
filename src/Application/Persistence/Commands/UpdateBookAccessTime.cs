using NodaTime;

namespace BookManager.Application.Persistence.Commands;

public record UpdateBookAccessTimeCommand(Guid BookId, Guid UserId) : IRequest;

public class UpdateBookAccessTimeHandler(IAppDbContext dbContext) : IRequestHandler<UpdateBookAccessTimeCommand>
{
    public async Task Handle(UpdateBookAccessTimeCommand request, CancellationToken cancellationToken)
    {
        var found = await dbContext.BookUserStatsSet.FindAsync([request.BookId, request.UserId], cancellationToken);
        if (found != null)
        {
            found.RecentAccess = SystemClock.Instance.GetCurrentInstant();
        }
        else
        {
            var newStats = new BookUserStats
            {
                BookId = request.BookId,
                UserId = request.UserId,
                RecentAccess = SystemClock.Instance.GetCurrentInstant()
            };
            dbContext.BookUserStatsSet.Add(newStats);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}