namespace BookManager.Application.Common.DTOs;

public sealed record BookDocumentGroupDto
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public ICollection<BookDocumentDto>? BookDocuments { get; init; } = null!;

    public BookDocumentGroup ToEntity()
    {
        var entity = new BookDocumentGroup
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