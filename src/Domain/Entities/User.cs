using Microsoft.AspNetCore.Identity;

namespace BookManager.Domain.Entities;

public sealed class User : IdentityUser<Guid>
{
    public IEnumerable<BookUserStats> Stats { get; } = new List<BookUserStats>();

    public IEnumerable<Ticket> Tickets { get; } = new List<Ticket>();
}