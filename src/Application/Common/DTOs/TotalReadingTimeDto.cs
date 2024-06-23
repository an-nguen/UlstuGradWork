using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public record class TotalReadingTimeDto(Guid TicketId, long TimeInSeconds);

public static class TotalReadingTimeExtensions
{
    public static TotalReadingTimeDto ToDto(this TotalReadingTime trt)
    {
        return new TotalReadingTimeDto(trt.TicketId, trt.TimeInSeconds);
    }
}