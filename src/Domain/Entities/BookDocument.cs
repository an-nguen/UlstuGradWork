using System.ComponentModel.DataAnnotations;
using BookManager.Domain.Enums;
using NodaTime;

namespace BookManager.Domain.Entities;

public sealed class BookDocument
{
    [Key] public Guid Id { get; init; }

    [Required] [MaxLength(64)] public required string FileHash { get; init; }

    [Required] [MaxLength(4096)] public required string Filepath { get; init; }

    [Required] public required DocumentFileType FileType { get; init; }

    [Required] public required long FileSize { get; init; }

    [MaxLength(256)] public string? Title { get; init; }

    [MaxLength(256)] public string? Isbn { get; init; }

    [MaxLength(16 * 1024)] public string? Description { get; init; }

    [MaxLength(256)] public string? PublisherName { get; init; }

    public string[]? Tags { get; init; }

    public Instant? RecentAccess { get; set; }

    public Guid? GroupId { get; init; }

    public byte[]? Thumbnail { get; init; }

    public BookDocumentGroup? Group { get; init; }
}