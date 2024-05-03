using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces;

public interface IAuthenticationService
{
    public Task<AuthenticationResponseDto> SignIn(AuthenticationRequestDto request);
    public Task<AuthenticationResponseDto> RefreshToken(string refreshTokenString);
}