namespace BookManager.Application.Common.DTOs;

public sealed record BookGroupDto
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public ICollection<BookDto>? BookDocuments { get; init; } = null!;

    public BookGroup ToEntity()
    {
        var entity = new BookGroup
        {
            Id = Id,
            Name = Name
        };
        if (BookDocuments is { Count: > 0 })
        {
            entity.BookDocuments = BookDocuments.Select(d => d.ToEntity()).ToList();
        }
        return entity;
    }
}