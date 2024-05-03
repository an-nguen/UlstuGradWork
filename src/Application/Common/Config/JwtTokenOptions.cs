namespace BookManager.Application.Common.Config;

public class JwtTokenOptions
{
    public const string Jwt = "Jwt";

    public string Issuer { get; init; } = Constants.Default.Issuer;
    public string Audience { get; init; } = Constants.Default.Audience;
    public uint AccessTokenLifetimeInMinutes { get; init; } = Constants.Default.AccessTokenLifetimeInMinutes;
    public uint RefreshTokenLifetimeInMinutes { get; init; } = Constants.Default.RefreshTokenLifetimeInMinutes;
    public string Key { get; init; } = string.Empty;
}