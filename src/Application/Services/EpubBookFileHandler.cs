using System.Text;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces.Services;
using BookManager.Domain.Enums;
using HtmlAgilityPack;
using VersOne.Epub;

namespace BookManager.Application.Services;

public sealed class EpubBookFileHandler: IBookFileHandler
{
    public BookFileType FileType => BookFileType.Epub;

    public int? CountNumberOfPages(Stream bookFileStream)
    {
        return null;
    }

    public RawImageDto? GetPreviewImage(Stream bookFileStream)
    {
        var book = EpubReader.ReadBook(bookFileStream);
        // book.CoverImage; 
        // TODO: Need to implement GetJpegImageAsync
        return null;
    }

    public Task<Stream> GetJpegImageAsync(RawImageDto rawImage)
    {
        throw new NotImplementedException();
    }

    public IEnumerable<BookText> ReadAllText(Guid bookId, Stream stream)
    {
        var book = EpubReader.ReadBook(stream);
        var contents = book
            .ReadingOrder
            .Select(textContent => new BookText
            {
                BookDocumentId = bookId,
                Text = PrintTextContentFile(textContent),
            }).ToList();
        stream.Dispose();
        return contents.AsEnumerable();
    }
    
    public string? GetBookTitle(Stream bookFileStream)
    {
        using var document = EpubReader.OpenBook(bookFileStream);
        return string.IsNullOrEmpty(document.Title) ? null : document.Title;
    }
    
    private static string PrintTextContentFile(EpubLocalTextContentFile textContentFile)
    {
        HtmlDocument htmlDocument = new();
        htmlDocument.LoadHtml(textContentFile.Content);
        StringBuilder sb = new();
        foreach (var node in htmlDocument.DocumentNode.SelectNodes("//text()"))
        {
            sb.AppendLine(node.InnerText.Trim());
        }

        var contentText = sb.ToString();
        return contentText;
    }
}