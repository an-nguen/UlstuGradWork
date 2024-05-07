using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public sealed record DetectLanguageRequestDto(string Text);

[TranspilationSource]
public sealed record DetectLanguageResponseDto(string DetectedLanguageCode);