
using System.Threading.Channels;

namespace BookManager.Application.Notification;

public interface INotificationService
{
    public ValueTask<Channel<Notification>> SubscribeAsync(CancellationToken cancellationToken);
    public ValueTask UnsubscribeAsync(Channel<Notification> channel);
    public ValueTask SendAsync(Notification notification, CancellationToken cancellationToken);
}