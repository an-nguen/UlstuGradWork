namespace BookManager.Application.Common.DTOs;

public sealed record FileChunkDto
{
    public required string Hash { get; init; }
    public required byte[] Data { get; init; }
}