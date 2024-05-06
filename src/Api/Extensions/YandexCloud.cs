using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Yandex.Cloud;
using Yandex.Cloud.Credentials;

namespace BookManager.Api.Extensions;

public class JwtCredentialsProvider(string keyId, string serviceAccountId, string privateKeyFilePath): ICredentialsProvider
{
    private readonly HttpClient _httpClient = new();
    private const string TokensUrl = "https://iam.api.cloud.yandex.net/iam/v1/tokens";

    public string GetToken()
    {
        var now = DateTime.UtcNow;
        
        var rsa = RSA.Create();
        rsa.ImportFromPem(File.ReadAllText(privateKeyFilePath).ToCharArray());
        var securityKey = new RsaSecurityKey(rsa)
        {
            KeyId = keyId
        };
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.RsaSsaPssSha256);
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = serviceAccountId,
            Audience = TokensUrl,
            IssuedAt = now,
            Expires = now.AddMinutes(60),
            SigningCredentials = credentials,
        };

        var jwtHandler = new JsonWebTokenHandler();
        var encodedToken = jwtHandler.CreateToken(descriptor);
        if (encodedToken == null) return string.Empty;
        var content = new Dictionary<string, object?>()
        {
            ["jwt"] = encodedToken
        };
        var request = new HttpRequestMessage(HttpMethod.Post, TokensUrl)
        {
            Content = JsonContent.Create(content)
        };
        var response = _httpClient.Send(request);
        var data = JsonSerializer.Deserialize<Data>(response.Content.ReadAsByteArrayAsync().Result);
        return data?.IamToken ?? string.Empty;
    }

    private class Data
    {
        [JsonPropertyName("iamToken")]
        public string IamToken { get; set; }

        [JsonPropertyName("expiresAt")]
        public string ExpiresAt { get; set; }
    }
}

public static class YandexCloud
{
    public static WebApplicationBuilder AddYandexCloudSdk(this WebApplicationBuilder builder)
    {
        var ycOptions = builder.Configuration.GetSection(YandexCloudOptions.YandexCloud)
            .Get<YandexCloudOptions>();
        if (ycOptions == null) return builder;

        var credentialsProvider =
            new JwtCredentialsProvider(ycOptions.KeyId, ycOptions.ServiceAccountId, ycOptions.PrivateKeyFilePath);
        var sdk = new Sdk(credentialsProvider);
        
        builder.Services.AddScoped<Sdk>(_ => sdk);
        
        return builder;
    }
}