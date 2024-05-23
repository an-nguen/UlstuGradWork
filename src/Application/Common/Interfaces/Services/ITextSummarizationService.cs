using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface ITextSummarizationService
{
    public Task<TextSummarizationResponseDto> SummarizeTextAsync(TextSummarizationRequestDto request);
}