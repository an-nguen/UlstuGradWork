using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using Microsoft.AspNetCore.Mvc;
using ArgumentException = System.ArgumentException;

namespace BookManager.Api.Controllers;

[ApiController]
[Route("users")]
public sealed class UserController(IUserService service): ControllerBase
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
    [Route("{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UserAddRequest request)
    {        
        IActionResult actionResult;
        try
        {
            var createdUser = await service.UpdateUser(id, request);
            actionResult = Ok(createdUser);
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
    [Route("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
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