using BookManager.Domain.Enums;

namespace BookManager.Application.Common.DTOs;

public sealed record FileMetadataDto
{
    public required string Name { get; init; }
    public required string Hash { get; init; }
    public required long Size { get; set; }
    public required DocumentFileType DocumentFormatType { get; init; }
}