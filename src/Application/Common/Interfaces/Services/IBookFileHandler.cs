using BookManager.Application.Common.DTOs;
using BookManager.Domain.Enums;

namespace BookManager.Application.Common.Interfaces.Services;

public interface IBookFileHandler
{
    public BookFileType FileType { get; }

    public int? CountNumberOfPages(Stream bookStream);

    public IEnumerable<string> GetAuthorList(Stream bookStream);
    
    public RawImageDto? GetPreviewImage(Stream bookStream);

    public Task<Stream> GetJpegImageAsync(RawImageDto rawImage);

    public string? GetBookTitle(Stream bookStream);
    
    public IAsyncEnumerable<BookText> StreamBookTexts(Guid bookId, Stream stream);
}