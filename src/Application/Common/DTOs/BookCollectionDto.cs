namespace BookManager.Application.Common.DTOs;

public sealed record BookCollectionDto
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public ICollection<BookDto>? Books { get; init; } = null!;

    public BookCollection ToEntity()
    {
        var entity = new BookCollection
        {
            Id = Id,
            Name = Name
        };
        if (Books is { Count: > 0 })
        {
            entity.Books = Books.Select(d => d.ToEntity()).ToList();
        }
        return entity;
    }
}