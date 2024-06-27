using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public sealed class SearchRequestDto
{
    public int PageSize { get; set; }
    public int PageNumber { get; set; }
    public string? SortProperty { get; init; }
    public SortOrder? SortOrder { get; init; }

    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Isbn { get; set; }
    public string? PublisherName { get; set; }
    public string[]? Authors { get; set; }
}

public record TextSearchRequestDto(string Pattern);