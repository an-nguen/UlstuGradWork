using BookManager.Application.Common;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces.Services;
using BookManager.Domain.Enums;
using Docnet.Core;
using Docnet.Core.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using UglyToad.PdfPig;

namespace BookManager.Application.Services;

internal sealed class PdfBookFileHandler : IBookFileHandler
{
    public BookFileType FileType => BookFileType.Pdf;

    public int? CountNumberOfPages(Stream bookStream)
    {
        bookStream.Seek(0, SeekOrigin.Begin);
        using var document = PdfDocument.Open(bookStream);
        return document.NumberOfPages;
    }

    public IEnumerable<string> GetAuthorList(Stream bookStream)
    {
        bookStream.Seek(0, SeekOrigin.Begin);
        using var document = PdfDocument.Open(bookStream);
        var authors = document.Information.Author;
        return new List<string>([authors]);
    }

    public RawImageDto? GetPreviewImage(Stream bookStream)
    {
        using var stream = new MemoryStream();
        bookStream.Seek(0, SeekOrigin.Begin);
        bookStream.CopyTo(stream);
        using var docReader = DocLib.Instance.GetDocReader(
            stream.ToArray(),
            new PageDimensions(Constants.ThumbnailPreviewWidth, Constants.ThumbnailPreviewHeight
            ));

        using var pageReader = docReader.GetPageReader(0);
        var rawBytes = pageReader.GetImage();
        if (rawBytes == null) return null;
        var width = pageReader.GetPageWidth();
        var height = pageReader.GetPageHeight();
        return new RawImageDto(rawBytes, width, height);
    }


    public async Task<Stream> GetJpegImageAsync(RawImageDto rawImage)
    {
        var image = Image.LoadPixelData<Bgra32>(rawImage.Data, rawImage.Width, rawImage.Height);
        image.Mutate(x => x.BackgroundColor(Color.White));
        var stream = new MemoryStream();
        await image.SaveAsJpegAsync(stream);
        return stream;
    }

    public string? GetBookTitle(Stream bookStream)
    {
        bookStream.Seek(0, SeekOrigin.Begin);
        using var document = PdfDocument.Open(bookStream);
        return document.Information.Title;
    }

    public async IAsyncEnumerable<BookText> StreamBookTexts(Guid bookId, Stream stream)
    {
        stream.Seek(0, SeekOrigin.Begin);
        var document = PdfDocument.Open(stream);
        var pages = document.GetPages()
            .Select(page => new BookText
            {
                BookDocumentId = bookId,
                Text = page.Text.Replace("\u0000", string.Empty),
                PageNumber = page.Number
            }
            );
        await foreach (var bookText in pages.ToAsyncEnumerable())
        {
            yield return bookText;
        }
        document.Dispose();
    }
}