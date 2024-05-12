using NodaTime;

namespace BookManager.Domain.Entities;

public sealed class BookUserStats
{
    public Guid UserId { get; init; }
    
    public Guid BookId { get; init; }
    
    public Instant RecentAccess { get; set; }
    
    public long TotalReadingTime { get; set; }
    
    public int? LastViewedPage { get; set; }
}