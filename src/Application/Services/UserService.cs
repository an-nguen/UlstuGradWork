using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using BookManager.Application.Common.Interfaces.Services;
using BookManager.Application.Persistence.Commands;
using BookManager.Application.Persistence.Queries;

namespace BookManager.Application.Services;

public sealed class UserService(ISender sender): IUserService
{
    public IAsyncEnumerable<UserDto> GetAllUsers()
    {
        return sender.CreateStream(new GetUsersQuery()).Select(entity => entity.ToDto());
    }

    public async Task<UserDto> CreateUser(AddUserRequest request)
    {
        var user = await sender.Send(new AddUserCommand(request.ToEntity()));
        return user.ToDto();
    }

    public async Task<UserDto> UpdateUser(Guid id, AddUserRequest request)
    {
        var foundUser = await sender.Send(new GetUserByIdQuery(id)) ?? throw new EntityNotFoundException();
        foundUser.Name = request.Name;
        foundUser.PinCode = request.PinCode;
        var updatedUser = await sender.Send(new UpdateUserCommand(foundUser));
        return updatedUser.ToDto();
    }

    public async Task DeleteUser(Guid id)
    {
        await sender.Send(new DeleteUserCommand(id));
    }
}