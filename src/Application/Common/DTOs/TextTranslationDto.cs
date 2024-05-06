namespace BookManager.Application.Common.DTOs;

public sealed record TranslationRequestDto
{
    public string? SourceLanguage { get; init; }
    public string TargetLanguage { get; init; } = string.Empty;
    public string SourceText { get; init; } = string.Empty;
}

public sealed record TranslationResponseDto
{
    public string TargetLanguage { get; init; } = string.Empty;
    public string TranslatedText { get; init; } = string.Empty;
}