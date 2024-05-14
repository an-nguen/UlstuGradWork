using System.ComponentModel.DataAnnotations;
using BookManager.Domain.Enums;

namespace BookManager.Domain.Entities;

public sealed class Book
{
    [Key] public Guid Id { get; init; }

    [Required] public required BookFileType FileType { get; init; }
    
    [Required] public required string Filename { get; init; }

    [Required] public required long FileSize { get; init; }

    [MaxLength(256)] public string? Title { get; set; }

    [MaxLength(256)] public string? Isbn { get; set; }

    [MaxLength(16 * 1024)] public string? Description { get; set; }

    [MaxLength(256)] public string? PublisherName { get; set; }

    public string[]? Tags { get; set; }
    
    public int? PageCount { get; set; }
    
    public string? ThumbnailFilename { get; init; }
    
    public IEnumerable<BookUserStats> Stats { get; } = new List<BookUserStats>();
}