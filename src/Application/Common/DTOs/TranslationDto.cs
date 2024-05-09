using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public sealed record TranslationRequestDto
{
    public string? SourceLanguage { get; init; }
    public string TargetLanguage { get; init; } = string.Empty;
    public string SourceText { get; init; } = string.Empty;
}

[TranspilationSource]
public sealed record TranslationResponseDto
{
    public string? DetectedSourceLanguage { get; init; }
    public string TargetLanguage { get; init; } = string.Empty;
    public string TranslatedText { get; init; } = string.Empty;
}
