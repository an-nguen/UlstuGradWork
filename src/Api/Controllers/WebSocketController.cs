using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using BookManager.Application.Notification;
using Microsoft.AspNetCore.Mvc;
using NodaTime;
using NodaTime.Serialization.SystemTextJson;

namespace BookManager.Api.Controllers;

[ApiController]
public class WebSocketController(INotificationService notificationService) : ControllerBase
{
    private readonly JsonSerializerOptions _serializerOptions =
        new JsonSerializerOptions(JsonSerializerDefaults.Web).ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);

    [Route("/ws")]
    public async Task Ws()
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
            await Handle(webSocket);
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }

    private async Task Handle(WebSocket webSocket)
    {
        var channel = await notificationService.SubscribeAsync(CancellationToken.None);
        while (await channel.Reader.WaitToReadAsync())
        {
            if (webSocket.State != WebSocketState.Open)
            {
                break;
            }
            while (channel.Reader.TryRead(out var notification))
            {
                var jsonString = JsonSerializer.Serialize(notification, _serializerOptions);
                await webSocket.SendAsync(
                    new ArraySegment<byte>(Encoding.UTF8.GetBytes(jsonString)),
                    WebSocketMessageType.Text,
                    WebSocketMessageFlags.EndOfMessage,
                    CancellationToken.None
                );
            }
        }

        await notificationService.UnsubscribeAsync(channel);
    }
}