using BookManager.Application.Common.Exceptions;
using BookManager.Domain.Enums;
using NodaTime;

namespace BookManager.Application.Persistence.Commands;

public record PartialUpdateBookDocumentCommand : IRequest<BookDocument>
{
    public required Guid Id { get; init; }
    public string? HashId { get; init; }
    public string? Filepath { get; init; }
    public string? FileHash { get; init; }
    public DocumentFileType? DocumentFileType { get; init; }
    public string? Title { get; init; }
    public string? Isbn { get; init; }
    public string? Description { get; init; }
    public string? PublisherName { get; init; }
    public byte[]? Thumbnail { get; init; }
    public Instant? RecentAccess { get; init; }
}

/// <summary>
///     This handler updates only whose entity props that are not null in the command request
/// </summary>
/// <param name="dbContext"></param>
public sealed class PartialUpdateBookDocumentHandler(AppDbContext dbContext)
    : IRequestHandler<PartialUpdateBookDocumentCommand, BookDocument>
{
    public async Task<BookDocument> Handle(PartialUpdateBookDocumentCommand request,
        CancellationToken cancellationToken)
    {
        var found = await dbContext.BookDocuments.FindAsync([request.Id], cancellationToken)
                    ?? throw new EntityNotFoundException();

        foreach (var property in dbContext.Entry(found).Properties)
        {
            var propName = property.Metadata.Name;
            var updatedValue = request.GetType().GetProperty(propName)?.GetValue(request);
            if (updatedValue is string strVal && string.IsNullOrEmpty(strVal))
                continue;
            if (updatedValue == null || property.Metadata.IsPrimaryKey())
                continue;
            property.CurrentValue = updatedValue;
            property.IsModified = true;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return found;
    }
}