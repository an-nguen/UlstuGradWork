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

public sealed class PdfBookFileHandler : IBookFileHandler
{
    public BookFileType FileType => BookFileType.Pdf;

    public RawImageDto? GetPreviewImage(Stream bookFileStream)
    {
        using var stream = new MemoryStream();
        bookFileStream.CopyTo(stream);
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

    public string? GetBookTitle(Stream bookFileStream)
    {
        using var document = PdfDocument.Open(bookFileStream);
        return document.Information.Title;
    }

    public IEnumerable<BookText> ReadAllText(Guid bookId, Stream stream)
    {
        var document = PdfDocument.Open(stream);
        var pages = document.GetPages().Select(page => new BookText
            {
                BookDocumentId = bookId,
                Text = page.Text,
                PageNumber = page.Number
            }
        ).ToList().AsEnumerable();
        return pages;
    }
}