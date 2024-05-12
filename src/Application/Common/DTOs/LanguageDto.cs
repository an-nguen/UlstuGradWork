using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public sealed record LanguageDto(string Code, string Name);