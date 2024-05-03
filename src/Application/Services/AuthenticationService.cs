using System.Security.Claims;
using BookManager.Application.Common.Config;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace BookManager.Application.Services;

public class AuthenticationService(
    UserManager<User> userManager,
    IOptions<JwtTokenOptions> options,
    TokenValidationParameters tokenValidationParameters,
    SecurityKey jsonWebKey)
    : IAuthenticationService
{
    private readonly JwtTokenOptions _jwtOptions = options.Value;
    private readonly JsonWebTokenHandler _tokenHandler = new JsonWebTokenHandler();

    public async Task<AuthenticationResponseDto> SignIn(AuthenticationRequestDto request)
    {
        var user = await userManager.FindByNameAsync(request.Name);
        if (user == null)
            return new AuthenticationResponseDto { Status = AuthenticationStatus.Failed };
        var verificationResult = userManager.PasswordHasher
            .VerifyHashedPassword(user, user.PasswordHash!, request.PinCode);
        if (verificationResult == PasswordVerificationResult.Failed) 
            return new AuthenticationResponseDto { Status = AuthenticationStatus.Failed };
        var accessToken = GenerateToken(user, _jwtOptions.AccessTokenLifetimeInMinutes);
        var refreshToken = GenerateToken(user, _jwtOptions.RefreshTokenLifetimeInMinutes);
        return new AuthenticationResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };
    }

    public async Task<AuthenticationResponseDto> RefreshToken(string refreshTokenString)
    {
        var token = _tokenHandler.ReadJsonWebToken(refreshTokenString);
        var validationResult = await _tokenHandler.ValidateTokenAsync(token, tokenValidationParameters);
        if (!validationResult.IsValid || validationResult.Claims[ClaimTypes.NameIdentifier] is not string userName) 
            return new AuthenticationResponseDto { Status = AuthenticationStatus.Failed };
        var user = await userManager.FindByNameAsync(userName);
        if (user == null) return new AuthenticationResponseDto { Status = AuthenticationStatus.Failed };
        return new AuthenticationResponseDto
        {
            AccessToken = GenerateToken(user, _jwtOptions.AccessTokenLifetimeInMinutes)
        };
    }
    
    
    private string GenerateToken(User user, double lifetimeInMinutes)
    {
        var credentials = new SigningCredentials(jsonWebKey, SecurityAlgorithms.EcdsaSha256Signature);
        var claims = new Dictionary<string, object>
        {
            [ClaimTypes.NameIdentifier] = user.UserName!,
        };
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = _jwtOptions.Issuer,
            Audience = _jwtOptions.Audience,
            Claims = claims,
            Expires = DateTime.Now.AddMinutes(lifetimeInMinutes),
            SigningCredentials = credentials
        };
        // _jwtOptions.Issuer,
        // _jwtOptions.Audience,
        // claims,
        // expires: DateTime.Now.AddMinutes(lifetimeInMinutes),
        // signingCredentials: credentials
        return _tokenHandler.CreateToken(descriptor);
    }
}