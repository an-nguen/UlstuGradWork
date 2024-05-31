using System.Threading.Channels;

namespace BookManager.Application.Indexing;

public sealed class IndexingTaskQueue: IIndexingTaskQueue
{
    private readonly Channel<IndexingWorkItem> _queue;

    public IndexingTaskQueue(int capacity)
    {
        var options = new BoundedChannelOptions(capacity)
        {
            FullMode = BoundedChannelFullMode.Wait
        };
        _queue = Channel.CreateBounded<IndexingWorkItem>(options);
    }
    
    public async ValueTask QueueAsync(IndexingWorkItem workItem)
    {
        await _queue.Writer.WriteAsync(workItem);
    }

    public async ValueTask<IndexingWorkItem> DequeueAsync(CancellationToken cancellationToken)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}