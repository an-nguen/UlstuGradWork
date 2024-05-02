namespace BookManager.Application.Indexing;

public interface IIndexingTaskQueue
{
    ValueTask QueueAsync(IndexingWorkItem workItem);
    ValueTask<IndexingWorkItem> DequeueAsync(CancellationToken cancellationToken);
}