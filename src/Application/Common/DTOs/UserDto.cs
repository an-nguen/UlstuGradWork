using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public sealed record UserDto(Guid Id, string Name);

public static class UserEntityExtensions
{
    public static UserDto ToDto(this User user)
    {
        return new UserDto(user.Id, user.UserName ?? "");
    }
}