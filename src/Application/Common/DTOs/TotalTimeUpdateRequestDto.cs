using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public class TotalTimeUpdateRequestDto
{
    public required Guid TicketId { get; init; }
    public required long Seconds { get; init; }
}