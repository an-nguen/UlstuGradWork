using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public class TotalTimeUpdateRequestDto
{
    public long Seconds { get; init; }
}