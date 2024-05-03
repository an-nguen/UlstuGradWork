using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;
using SameSiteMode = Microsoft.AspNetCore.Http.SameSiteMode;

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
            Response.Cookies.Append("refresh_token", authenticationResponse.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
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
        var refreshToken = Request.Cookies["refresh_token"];
        if (refreshToken == null) return Unauthorized();
        var response = await service.RefreshToken(refreshToken);
        return response.Status switch
        {
            AuthenticationStatus.Failed => Unauthorized(),
            AuthenticationStatus.Success => Ok(response),
            _ => Unauthorized()
        };
    }
}