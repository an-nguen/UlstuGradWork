using BookManager.Application.Common.DTOs;
using BookManager.Domain.Enums;

namespace BookManager.Application.Common.Interfaces.Services;

public interface IBookFileHandler
{
    public BookFileType FileType { get; }

    public int? CountNumberOfPages(Stream bookFileStream);
    
    public RawImageDto? GetPreviewImage(Stream bookFileStream);

    public Task<Stream> GetJpegImageAsync(RawImageDto rawImage);

    public string? GetBookTitle(Stream bookFileStream);
    
    public IEnumerable<BookText> ReadAllText(Guid bookId, Stream stream);
}