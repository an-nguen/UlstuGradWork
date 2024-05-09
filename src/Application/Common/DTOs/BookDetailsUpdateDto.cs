using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public record BookDetailsUpdateDto(
    string? Title, 
    string? Description, 
    string? Isbn, 
    string? PublisherName
);