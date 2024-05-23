using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace BookManager.Api.Extensions;

public static class SecurityExtensions
{
    public static IServiceCollection AddTokenBasedSecurity(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtTokenOptionsSection = configuration.GetSection(JwtTokenOptions.Jwt);
        var jwtTokenOptions = jwtTokenOptionsSection.Get<JwtTokenOptions>() ?? new JwtTokenOptions();
        var jsonWebKey = new JsonWebKey(File.ReadAllText("./jwk.json", Encoding.UTF8));
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = jwtTokenOptions.Issuer,
            ValidAudience = jwtTokenOptions.Audience,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = jsonWebKey,
        }; 
        services.AddSingleton<SecurityKey, JsonWebKey>(_ => jsonWebKey);
        services.AddSingleton<TokenValidationParameters>(_ => tokenValidationParameters);
        services.Configure<JwtTokenOptions>(jwtTokenOptionsSection);
        services.AddAuthentication().AddJwtBearer(options =>
        {
            options.TokenValidationParameters = tokenValidationParameters;
        });
        
        return services;
    }
}