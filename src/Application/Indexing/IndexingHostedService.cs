using BookManager.Application.Common.Interfaces.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BookManager.Application.Indexing;

public sealed class IndexingHostedService(
    ILogger<IndexingHostedService> logger,
    IIndexingTaskQueue queue,
    IServiceProvider serviceProvider) : BackgroundService
{
    public override async Task StopAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Queued Indexing Hosted Service is stopping.");

        await base.StopAsync(stoppingToken);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var workItem = await queue.DequeueAsync(stoppingToken);

            try
            {
                using var scope = serviceProvider.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<IIndexingService>();
                int deletedCount;
                switch (workItem.OperationType)
                {
                    case IndexingWorkItemOperationType.Created:
                        await service.IndexDocumentAsync(workItem.BookDocumentId, stoppingToken);
                        logger.LogInformation(
                            "The text of the document {} was added for full-text search.",
                            workItem.BookDocumentId
                        );
                        break;
                    case IndexingWorkItemOperationType.Replaced:
                        deletedCount = await service.DeleteDocumentTextsAsync(workItem.BookDocumentId, stoppingToken);
                        logger.LogInformation(
                            "The text of the {} document was deleted successfully. (deleted rows = {})",
                            workItem.BookDocumentId,
                            deletedCount
                        );
                        await service.IndexDocumentAsync(workItem.BookDocumentId, stoppingToken);
                        logger.LogInformation(
                            "The text of the document {} was added for full-text search.",
                            workItem.BookDocumentId
                        );
                        break;
                    case IndexingWorkItemOperationType.Deleted:
                        deletedCount = await service.DeleteDocumentTextsAsync(workItem.BookDocumentId, stoppingToken);
                        logger.LogInformation(
                            "The text of {} for indexing was deleted successfully. (deleted rows = {})",
                            workItem.BookDocumentId,
                            deletedCount
                        );
                        break;
                    default:
                        throw new ArgumentOutOfRangeException(nameof(stoppingToken));
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex,
                    "Error occurred executing {WorkItem}.", nameof(workItem));
            }
        }
    }
}