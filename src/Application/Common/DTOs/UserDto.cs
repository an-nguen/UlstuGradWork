using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public sealed record UserDto(Guid Id, string Name);

[TranspilationSource]
public record UserAddRequest(string Name, string PinCode);

[TranspilationSource]
public record UserUpdateRequest(string CurrentPINCode, string NewPINCode);

[TranspilationSource]
public record UserDeleteRequest(string CurrentPINCode);

public static class UserEntityExtensions
{
    public static UserDto ToDto(this User user)
    {
        return new UserDto(user.Id, user.UserName ?? "");
    }
}