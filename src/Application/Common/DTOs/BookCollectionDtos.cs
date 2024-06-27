using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
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

[TranspilationSource]
public sealed record BookCollectionModRequest(string Name, ICollection<BookDto>? Books);

public static class BookCollectionExtensions
{
    public static BookCollectionDto ToDto(this BookCollection bookCollection)
    {
        return new BookCollectionDto
        {
            Id = bookCollection.Id,
            Name = bookCollection.Name,
            Books = bookCollection.Books.Select(b => b.ToDto()).ToList()
        };
    }
}