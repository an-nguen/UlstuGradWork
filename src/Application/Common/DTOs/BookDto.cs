using System.Net.Mime;
using BookManager.Domain.Enums;
using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public sealed record BookDto
{
    public required Details DocumentDetails { get; init; }

    public required BookFileMetadata FileMetadata { get; init; }

    public UserStats? Stats { get; init; }

    public Book ToEntity()
    {
        return new Book
        {
            Id = DocumentDetails.Id,
            Description = DocumentDetails.Description,
            Isbn = DocumentDetails.Isbn,
            PublisherName = DocumentDetails.PublisherName,
            Title = DocumentDetails.Title,
            Filename = string.Empty,
            FileType = FileMetadata.Type,
            FileSize = FileMetadata.Size,
            ThumbnailFilename = string.Empty,
            Authors = DocumentDetails.Authors,
            Tags = DocumentDetails.Tags
        };
    }

    public string GetContentType()
    {
        return FileMetadata.Type switch
        {
            BookFileType.Pdf => MediaTypeNames.Application.Pdf,
            BookFileType.Epub => "application/epub+zip",
            _ => throw new ArgumentOutOfRangeException()
        };
    }

    [TranspilationSource]
    public class Details
    {
        public Guid Id { get; init; }
        public string? Title { get; set; }
        public string? Isbn { get; set; }
        public string? Description { get; set; }
        public string? PublisherName { get; set; }
        public string? ThumbnailUrl { get; set; }
        public int? PageCount { get; set; }
        public string[]? Authors { get; set; }
        public string[]? Tags { get; set; }
    }

    [TranspilationSource]
    public class UserStats
    {
        public long? TotalReadingTime { get; init; }
        public DateTimeOffset? RecentAccessTime { get; set; }
        public int? LastViewedPage { get; set; }
        public IEnumerable<TotalReadingTimeDto>? TotalReadingTimes { get; init; }
    }

    [TranspilationSource]
    public record BookFileMetadata
    {
        public required BookFileType Type { get; init; }

        public required long Size { get; init; }
    }
}

public static class BookEntityExtensions
{
    public static BookDto ToDto(this Book entity)
    {
        var stats = entity.Stats.Any() ? entity.Stats.FirstOrDefault() : null;
        return new BookDto
        {
            DocumentDetails = new BookDto.Details
            {
                Id = entity.Id,
                Description = entity.Description,
                Isbn = entity.Isbn,
                PublisherName = entity.PublisherName,
                Title = entity.Title,
                ThumbnailUrl = string.Empty,
                PageCount = entity.PageCount,
                Authors = entity.Authors,
                Tags = entity.Tags,
            },
            FileMetadata = new BookDto.BookFileMetadata
            {
                Size = entity.FileSize,
                Type = entity.FileType
            },
            Stats = new BookDto.UserStats
            {
                TotalReadingTime = entity.TotalReadingTimes.Sum(trt => trt.TimeInSeconds),
                RecentAccessTime = stats?.RecentAccess?.ToDateTimeOffset() ?? null,
                LastViewedPage = stats?.LastViewedPage ?? null,
                TotalReadingTimes = entity.TotalReadingTimes.Select(trt => trt.ToDto()),
            },
        };
    }
}