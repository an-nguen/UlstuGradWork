using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using BookManager.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ArgumentException = System.ArgumentException;

namespace BookManager.Api.Controllers;

[ApiController]
[Route("users")]
public sealed class UserController(
    IUserService service,
    UserManager<User> userManager
) : ControllerBase
{
    [HttpGet]
    public IAsyncEnumerable<UserDto> GetAllUsers()
    {
        return service.GetAllUsers();
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] UserAddRequest request)
    {
        IActionResult actionResult;
        try
        {
            var createdUser = await service.CreateUser(request);
            actionResult = Ok(createdUser);
        }
        catch (ArgumentException e)
        {
            actionResult = BadRequest(e.Message);
        }

        return actionResult;
    }

    [HttpPut]
    [Authorize]
    [Route("{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UserAddRequest request)
    {
        var user = await userManager.GetUserAsync(HttpContext.User);
        if (user == null || user.Id != id)
        {
            return Forbid();
        } 
        IActionResult actionResult;
        try
        {
            var updatedUser = await service.UpdateUser(id, request);
            actionResult = Ok(updatedUser);
        }
        catch (ArgumentException e)
        {
            actionResult = BadRequest(e.Message);
        }
        catch (EntityNotFoundException)
        {
            actionResult = NotFound();
        }

        return actionResult;
    }

    [HttpDelete]
    [Authorize]
    [Route("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = await userManager.GetUserAsync(HttpContext.User);
        if (user == null || user.Id != id)
        {
            return Forbid();
        } 
        try
        {
            await service.DeleteUser(id);
        }
        catch (EntityNotFoundException)
        {
            return NotFound();
        }

        return Ok();
    }
}