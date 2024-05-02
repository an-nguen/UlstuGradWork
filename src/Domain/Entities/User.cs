using System.ComponentModel.DataAnnotations;

namespace BookManager.Domain.Entities;

public sealed class User
{
    [Key] public Guid Id { get; init; }
    public required string Name { get; set; }
    public required string PinCode { get; set; }
    public IEnumerable<BookUserStats> Stats { get; } = new List<BookUserStats>();
}