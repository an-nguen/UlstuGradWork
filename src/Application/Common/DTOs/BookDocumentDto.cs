using System.Net.Mime;
using BookManager.Domain.Enums;
using NodaTime;

namespace BookManager.Application.Common.DTOs;

public sealed record BookDocumentDto
{
    public required Details DocumentDetails { get; init; }

    public required DocumentFileMetadata FileMetadata { get; init; }

    public BookDocument ToEntity()
    {
        return new BookDocument
        {
            Id = DocumentDetails.Id,
            Description = DocumentDetails.Description,
            Isbn = DocumentDetails.Isbn,
            PublisherName = DocumentDetails.PublisherName,
            Title = DocumentDetails.Title,
            Filepath = string.Empty,
            FileHash = FileMetadata.Hash,
            FileType = FileMetadata.Type,
            FileSize = FileMetadata.Size,
            GroupId = DocumentDetails.GroupId,
            Thumbnail = DocumentDetails.Thumbnail
        };
    }

    public string GetContentType()
    {
        return FileMetadata.Type switch
        {
            DocumentFileType.Pdf => MediaTypeNames.Application.Pdf,
            DocumentFileType.Epub => "application/epub+zip",
            _ => throw new ArgumentOutOfRangeException()
        };
    }

    public record Details
    {
        public Guid Id { get; init; }
        public string? Title { get; init; }
        public string? Isbn { get; init; }
        public string? Description { get; init; }
        public string? PublisherName { get; init; }
        public Guid? GroupId { get; init; }
        public Instant? RecentAccess { get; init; }
        public byte[]? Thumbnail { get; init; }
        public string[]? Tags { get; init; }
    }

    public record DocumentFileMetadata
    {
        public required string Hash { get; init; }

        public required DocumentFileType Type { get; init; }

        public required long Size { get; init; }
    }
}

public static class BookDocumentEntityExtensions
{
    public static BookDocumentDto ToDto(this BookDocument entity)
    {
        return new BookDocumentDto
        {
            DocumentDetails = new BookDocumentDto.Details
            {
                Id = entity.Id,
                Description = entity.Description,
                Isbn = entity.Isbn,
                PublisherName = entity.PublisherName,
                Title = entity.Title,
                RecentAccess = entity.RecentAccess,
                GroupId = entity.GroupId,
                Thumbnail = entity.Thumbnail
            },
            FileMetadata = new BookDocumentDto.DocumentFileMetadata
            {
                Size = entity.FileSize,
                Hash = entity.FileHash,
                Type = entity.FileType
            }
        };
    }
}