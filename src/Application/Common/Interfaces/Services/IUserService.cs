using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface IUserService
{
    public IAsyncEnumerable<UserDto> GetAllUsers();
    public Task<UserDto> CreateUserAsync(UserAddRequest request);
    public Task<UserDto> UpdateUserAsync(Guid id, UserUpdateRequest request);
    public Task DeleteUserAsync(Guid id, UserDeleteRequest request);
}