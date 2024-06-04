using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public record UserAddRequest(string Name, string PinCode);

[TranspilationSource]
public record UserUpdateRequest(string CurrentPINCode, string NewPINCode);

[TranspilationSource]
public record UserDeleteRequest(string CurrentPINCode);