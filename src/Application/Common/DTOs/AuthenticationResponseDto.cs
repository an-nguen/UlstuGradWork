using System.Text.Json.Serialization;
using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public class AuthenticationResponseDto
{
    public AuthenticationStatus Status { get; set; } = AuthenticationStatus.Success;
    public string? AccessToken { get; set; } 
    [JsonIgnore]
    public string? RefreshToken { get; set; }
}

[TranspilationSource]
public enum AuthenticationStatus
{
    Failed,
    Success
}