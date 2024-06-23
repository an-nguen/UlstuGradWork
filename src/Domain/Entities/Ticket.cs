using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace BookManager.Domain.Entities;

/// <summary>
/// The ticket is an unique identifier issued for each user device. 
/// It should be stored on the client side in localStorage or similar.
/// </summary>
public sealed class Ticket
{
    [Key]
    public Guid Id { get; init; }

    public Guid UserId { get; init; }

    public User User { get; init; } = null!;

    public Instant IssuedAt { get; init; }
}