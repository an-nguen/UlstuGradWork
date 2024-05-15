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

    public int? CountNumberOfPages(Stream bookStream)
    {
        return null;
    }

    public IEnumerable<string> GetAuthorList(Stream bookStream)
    {
        bookStream.Seek(0, SeekOrigin.Begin);
        var book = EpubReader.ReadBook(bookStream);
        return book.AuthorList;
    }

    public RawImageDto? GetPreviewImage(Stream bookStream)
    {
        bookStream.Seek(0, SeekOrigin.Begin);
        var book = EpubReader.ReadBook(bookStream);
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
        stream.Seek(0, SeekOrigin.Begin);
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
    
    public string? GetBookTitle(Stream bookStream)
    {
        bookStream.Seek(0, SeekOrigin.Begin);
        using var document = EpubReader.OpenBook(bookStream);
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