using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public record AuthenticationRequestDto(string Name, string PinCode);