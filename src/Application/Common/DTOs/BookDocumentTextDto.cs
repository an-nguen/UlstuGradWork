namespace BookManager.Application.Common.DTOs;

public record BookDocumentTextDto
{
    public required Guid BookDocumentId { get; init; }

    public required string Text { get; init; }

    public int? PageNumber { get; init; }
}

public static class BookDocumentTextEntityExtensions
{
    public static BookDocumentTextDto ToDto(this BookDocumentText entity)
    {
        return new BookDocumentTextDto
        {
            BookDocumentId = entity.BookDocumentId,
            Text = entity.Text,
            PageNumber = entity.PageNumber
        };
    }
}