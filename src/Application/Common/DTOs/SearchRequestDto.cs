using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public sealed class SearchRequestDto
{
    public int PageSize { get; set; }
    public int PageNumber { get; set; }
    
    public string? Title { get; set; }
    public string? Isbn { get; set; }
    public string? PublisherName { get; set; }
}