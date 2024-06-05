using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using BookManager.Application.Common.Interfaces.Services;
using FluentValidation;
using Microsoft.AspNetCore.Identity;

namespace BookManager.Application.Services;

public sealed class UserService(
    IAppDbContext dbContext,
    IValidator<UserAddRequest> userAddRequestValidator,
    IValidator<UserUpdateRequest> userUpdRequestValidator,
    UserManager<User> userManager,
    IPasswordHasher<User> passwordHasher)
    : IUserService
{
    public IAsyncEnumerable<UserDto> GetAllUsers()
    {
        return dbContext.Users.Select(u => u.ToDto()).AsAsyncEnumerable();
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid id)
    {
        return (await dbContext.Users.FirstOrDefaultAsync(u => u.Id == id))?.ToDto();
    }

    public async Task<UserDto?> GetUserByNameAsync(string userName)
    {
        return (await dbContext.Users.FirstOrDefaultAsync(u => u.UserName == userName))?.ToDto();
    }

    public async Task<UserDto> CreateUserAsync(UserAddRequest request)
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

    public async Task<UserDto> UpdateUserAsync(Guid id, UserUpdateRequest request)
    {
        var validationResult = await userUpdRequestValidator.ValidateAsync(request);
        if (!validationResult.IsValid) throw new ArgumentException("Invalid request", nameof(request));

        var foundUser = await dbContext.Users.FindAsync([id]);
        if (foundUser == null || string.IsNullOrEmpty(foundUser.UserName)) throw new EntityNotFoundException();

        var isPINCodeValid = await userManager.CheckPasswordAsync(foundUser, request.CurrentPINCode);
        if (!isPINCodeValid) throw new ArgumentException("Invalid PIN-code", nameof(request));

        foundUser.PasswordHash = passwordHasher.HashPassword(foundUser, request.NewPINCode);

        var identityResult = await userManager.UpdateAsync(foundUser);
        if (!identityResult.Succeeded)
            throw new UserUpdateException("Failed to update user account.");

        var updatedUser = await userManager.FindByNameAsync(foundUser.UserName)
                          ?? throw new UserUpdateException("Failed to get user entity after an user account update.");

        return updatedUser.ToDto();
    }

    public async Task DeleteUserAsync(Guid id, UserDeleteRequest request)
    {
        if (string.IsNullOrEmpty(request.CurrentPINCode)) throw new ArgumentException("Invalid PIN-code", nameof(request));

        var foundUser = await dbContext.Users.FindAsync([id]) ?? throw new EntityNotFoundException();

        var isPINCodeValid = await userManager.CheckPasswordAsync(foundUser, request.CurrentPINCode);
        if (!isPINCodeValid) throw new ArgumentException("Invalid PIN-code", nameof(request));

        dbContext.Users.Remove(foundUser);
        await dbContext.SaveChangesAsync();
    }

}