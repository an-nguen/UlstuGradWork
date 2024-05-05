namespace BookManager.Application.Common.Interfaces.Services;

public interface IIndexingService
{
    Task IndexDocumentAsync(Guid bookId, CancellationToken cancellationToken);
    Task<int> DeleteDocumentTextsAsync(Guid bookDocumentId, CancellationToken cancellationToken);
}