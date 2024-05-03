using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public record UserAddRequest
{
    public required string Name { get; init; }
    public required string PinCode { get; init; }
}