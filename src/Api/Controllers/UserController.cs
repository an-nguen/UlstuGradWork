using BookManager.Application.Common.DTOs;
using Microsoft.AspNetCore.Mvc;

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
        return Ok(await service.CreateUser(request));
    }

    [HttpPut]
    [Route("{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UserAddRequest request)
    {
        return Ok(await service.UpdateUser(id, request));
    }
    
    [HttpDelete]
    [Route("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await service.DeleteUser(id);
        return Ok();
    }
}