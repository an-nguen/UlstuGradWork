using NodaTime;

namespace BookManager.Domain.Entities;

public sealed class BookUserStats
{
    public string UserId { get; init; } = null!;
    
    public Guid BookId { get; init; }
    
    public Instant RecentAccess { get; init; }
    
    public long TotalReadingTime { get; init; }
    
    public int? LastPage { get; init; }
}