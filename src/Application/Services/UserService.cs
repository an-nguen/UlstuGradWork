using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using BookManager.Application.Common.Interfaces.Services;
using BookManager.Application.Persistence.Commands;
using BookManager.Application.Persistence.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Identity;

namespace BookManager.Application.Services;

public sealed class UserService(
    ISender sender, 
    IValidator<UserAddRequest> userAddRequestValidator, 
    UserManager<User> userManager, 
    IPasswordHasher<User> passwordHasher)
    : IUserService
{
    public IAsyncEnumerable<UserDto> GetAllUsers()
    {
        return sender.CreateStream(new GetUsersQuery()).Select(entity => entity.ToDto());
    }

    public async Task<UserDto> CreateUser(UserAddRequest request)
    {
        var validationResult = await userAddRequestValidator.ValidateAsync(request);
        if (!validationResult.IsValid) throw new ArgumentException("Invalid request", nameof(request));
        var newUser = new User
        {
            UserName = request.Name,
        };
        newUser.PasswordHash = passwordHasher.HashPassword(newUser, request.PinCode);
        var identityResult = await userManager.CreateAsync(newUser);
        if (!identityResult.Succeeded)
            throw new UserCreationException("Failed to create a user");

        var user = await userManager.FindByNameAsync(newUser.UserName) 
                   ?? throw new UserCreationException("Failed to get user entity after an user account creation.");
        return user.ToDto();
    }

    public async Task<UserDto> UpdateUser(Guid id, UserAddRequest request)
    {
        var validationResult = await userAddRequestValidator.ValidateAsync(request);
        if (!validationResult.IsValid) throw new ArgumentException("Invalid request", nameof(request));
        var foundUser = await sender.Send(new GetUserByIdQuery(id)) ?? throw new EntityNotFoundException();
        foundUser.UserName = request.Name;
        foundUser.PasswordHash = passwordHasher.HashPassword(foundUser, request.PinCode);
       
        var identityResult = await userManager.UpdateAsync(foundUser);
        if (!identityResult.Succeeded)
            throw new UserUpdateException("Failed to update user account.");
        var updatedUser = await userManager.FindByNameAsync(foundUser.UserName) 
                          ?? throw new UserUpdateException("Failed to get user entity after an user account update.");
        return updatedUser.ToDto();
    }

    public async Task DeleteUser(Guid id)
    {
        await sender.Send(new DeleteUserCommand(id));
    }
}