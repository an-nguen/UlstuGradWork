using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface IUserService
{
    public IAsyncEnumerable<UserDto> GetAllUsers();
    public Task<UserDto> CreateUser(UserAddRequest request);
    public Task<UserDto> UpdateUser(Guid id, UserAddRequest request);
    public Task DeleteUser(Guid id);
}