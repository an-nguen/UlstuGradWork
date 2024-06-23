namespace BookManager.Application.Common.DTOs;

public record TextSearchRequestDto
{
    public string Pattern { get; init; } = string.Empty;
}