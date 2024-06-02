using System.Threading.Channels;

namespace BookManager.Application.Notification;

public class NotificationService : INotificationService
{
    private readonly List<Channel<Notification>> _consumers = [];

    public ValueTask<Channel<Notification>> SubscribeAsync(CancellationToken cancellationToken)
    {
        var consumerChannel = Channel.CreateUnbounded<Notification>();
        _consumers.Add(consumerChannel);
        return ValueTask.FromResult(consumerChannel);
    }

    public ValueTask UnsubscribeAsync(Channel<Notification> channel)
    {
        _consumers.Remove(channel);
        return ValueTask.CompletedTask;
    }

    public async ValueTask SendAsync(Notification notification, CancellationToken cancellationToken)
    {
        foreach (var consumer in _consumers)
        {
            await consumer.Writer.WriteAsync(notification, cancellationToken);
        }
    }
}