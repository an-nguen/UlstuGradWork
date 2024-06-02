using NodaTime;

namespace BookManager.Application.Notification;

public sealed record Notification(string Message, Instant DateTime);