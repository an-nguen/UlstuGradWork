namespace BookManager.Application.Common.DTOs;

public record TextSummarizationRequestDto(string Text);

public record TextSummarizationResponseDto(string SummarizedText);