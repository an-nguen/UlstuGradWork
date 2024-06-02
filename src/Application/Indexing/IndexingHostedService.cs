using BookManager.Application.Common.Interfaces.Services;
using BookManager.Application.Notification;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NodaTime;

namespace BookManager.Application.Indexing;

public sealed class IndexingHostedService(
    ILogger<IndexingHostedService> logger,
    IEnumerable<INotificationService> notificationServices,
    IIndexingTaskQueue queue,
    IServiceProvider serviceProvider
) : BackgroundService
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

            await HandleWorkItem(stoppingToken, workItem);
        }
    }

    private async Task HandleWorkItem(CancellationToken stoppingToken, IndexingWorkItem workItem)
    {
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
                    var bookIndexedNotification = new Notification.Notification(
                        $"The text of the document {workItem.BookDocumentId} was added for full-text search.",
                        SystemClock.Instance.GetCurrentInstant()
                    );
                    await Notify(bookIndexedNotification, stoppingToken);
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
                    var updatedNotification = new Notification.Notification(
                        $"The text of the document {workItem.BookDocumentId} was updated for full-text search.",
                        SystemClock.Instance.GetCurrentInstant()
                    );
                    await Notify(updatedNotification, stoppingToken);
                    break;
                case IndexingWorkItemOperationType.Deleted:
                    deletedCount = await service.DeleteDocumentTextsAsync(workItem.BookDocumentId, stoppingToken);
                    logger.LogInformation(
                        "The text of {} for indexing was deleted successfully. (deleted rows = {})",
                        workItem.BookDocumentId,
                        deletedCount
                    );
                    var bookTextDeletedNotification = new Notification.Notification(
                        $"The text of {workItem.BookDocumentId} for indexing was deleted successfully.",
                        SystemClock.Instance.GetCurrentInstant()
                    );
                    await Notify(bookTextDeletedNotification, stoppingToken);
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

    private async Task Notify(Notification.Notification notification, CancellationToken cancellationToken)
    {
        foreach (var service in notificationServices)
        {
            await service.SendAsync(notification, cancellationToken);
        }
    }
}