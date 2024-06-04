using BookManager.Application.Common;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BookManager.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthenticationController(
    IAuthenticationService service)
    : ControllerBase
{
    [HttpPost]
    [Route("sign-in")]
    public async Task<IActionResult> SignIn([FromBody] AuthenticationRequestDto request)
    {
        var authenticationResponse = await service.SignIn(request);
        if (authenticationResponse.RefreshToken != null)
        {
            Response.Cookies.Append(Constants.RefreshTokenCookieKey, authenticationResponse.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
            });
        }
        return authenticationResponse.Status switch
        {
            AuthenticationStatus.Failed => Unauthorized(),
            AuthenticationStatus.Success => Ok(authenticationResponse),
            _ => BadRequest()
        };
    }

    [HttpPost]
    [Route("refresh-token")]
    public async Task<IActionResult> RefreshToken()
    {
        var refreshToken = Request.Cookies[Constants.RefreshTokenCookieKey];
        if (refreshToken == null) return Unauthorized();
        var response = await service.RefreshToken(refreshToken);
        return response.Status switch
        {
            AuthenticationStatus.Failed => Unauthorized(),
            AuthenticationStatus.Success => Ok(response),
            _ => Unauthorized()
        };
    }

    [HttpPost]
    [Route("sign-out")]
    public new IActionResult SignOut()
    {
        Response.Cookies.Delete(Constants.RefreshTokenCookieKey);
        return Ok();
    }
}