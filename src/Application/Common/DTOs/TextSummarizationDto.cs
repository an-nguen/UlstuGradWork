using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public record TextSummarizationRequestDto(string Text);

[TranspilationSource]
public record TextSummarizationResponseDto(string SummarizedText);