using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public record AddUserRequest
{
    public required string Name { get; init; }
    public required string PinCode { get; init; }

    public User ToEntity()
    {
        return new User
        {
            Name = Name,
            PinCode = PinCode
        };
    }
}