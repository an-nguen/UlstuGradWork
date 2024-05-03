using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace BookManager.Api.Extensions;

public static class SecurityExtensions
{
    public static IServiceCollection AddTokenBasedSecurity(this WebApplicationBuilder builder)
    {
        var jwtTokenOptionsSection = builder.Configuration.GetSection(JwtTokenOptions.Jwt);
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
        builder.Services.AddSingleton<SecurityKey, JsonWebKey>(_ => jsonWebKey);
        builder.Services.AddSingleton<TokenValidationParameters>(_ => tokenValidationParameters);
        builder.Services.Configure<JwtTokenOptions>(jwtTokenOptionsSection);
        builder.Services.AddAuthentication().AddJwtBearer(options =>
        {
            options.TokenValidationParameters = tokenValidationParameters;
        });
        
        return builder.Services;
    }
}