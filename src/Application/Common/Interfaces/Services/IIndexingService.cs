namespace BookManager.Application.Common.Interfaces.Services;

public interface IIndexingService
{
    Task IndexDocumentAsync(Guid bookDocumentId, CancellationToken cancellationToken);
    Task<int> DeleteDocumentTextsAsync(Guid bookDocumentId, CancellationToken cancellationToken);
}