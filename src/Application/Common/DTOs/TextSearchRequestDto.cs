namespace BookManager.Application.Common.DTOs;

public record TextSearchRequestDto
{
    public int PageSize { get; init; }
    public int PageNumber { get; init; }
    public string Pattern { get; init; } = string.Empty;
}