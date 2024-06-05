using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public record BookTextDto
{
    public required Guid BookDocumentId { get; init; }

    public required string Text { get; init; }

    public int? PageNumber { get; init; }
}

public static class BookDocumentTextEntityExtensions
{
    public static BookTextDto ToDto(this BookText entity)
    {
        return new BookTextDto
        {
            BookDocumentId = entity.BookDocumentId,
            Text = entity.Text,
            PageNumber = entity.PageNumber
        };
    }
}