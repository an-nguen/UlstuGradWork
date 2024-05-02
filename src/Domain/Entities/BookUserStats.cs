using NodaTime;

namespace BookManager.Domain.Entities;

public sealed class BookUserStats
{
    public Guid UserId { get; init; }
    
    public Guid BookId { get; init; }
    
    public Instant RecentAccess { get; init; }
    
    public long TotalReadingTime { get; init; }
    
    public int? LastPage { get; init; }
}