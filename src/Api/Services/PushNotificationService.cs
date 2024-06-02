using System.Text.Json;
using System.Threading.Channels;
using BookManager.Api.Hubs;
using BookManager.Application.Notification;
using Microsoft.AspNetCore.SignalR;
using NodaTime;
using NodaTime.Serialization.SystemTextJson;

namespace BookManager.Api.Services;

public class PushNotificationService(IHubContext<NotificationHub> hubContext) : INotificationService
{
    private readonly JsonSerializerOptions _serializerOptions =
        new JsonSerializerOptions(JsonSerializerDefaults.Web).ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);

    public ValueTask<Channel<Notification>> SubscribeAsync(CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public ValueTask UnsubscribeAsync(Channel<Notification> channel)
    {
        throw new NotImplementedException();
    }

    public async ValueTask SendAsync(Notification notification, CancellationToken cancellationToken)
    {
        var jsonString = JsonSerializer.Serialize(notification, _serializerOptions);
        await hubContext.Clients.All.SendAsync("book-indexing", jsonString, cancellationToken);
    }
}