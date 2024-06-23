using NodaTime;
using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public sealed record TicketDto(Guid Id, Guid UserId, DateTimeOffset IssuedAt);

public static class TicketExtensions
{
    public static TicketDto ToDto(this Ticket ticket)
    {
        return new TicketDto(
            ticket.Id,
            ticket.UserId,
            ticket.IssuedAt.ToDateTimeOffset()
        );
    }
}