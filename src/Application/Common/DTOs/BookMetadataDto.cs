using BookManager.Domain.Enums;
using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public sealed record BookMetadataDto
{
    public required string Filename { get; init; }
    public required long FileSizeInBytes { get; init; }
    public required BookFileType FileType { get; init; }
    
    public string? Title { get; init; }
    public string? Isbn { get; init; }
    public string? Description { get; init; }
    public string? PublisherName { get; init; }
    public IEnumerable<string>? Authors { get; init; }
    public IEnumerable<string>? Tags { get; init; }
}