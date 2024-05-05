using System.Text;
using BookManager.Application.Common.Exceptions;
using BookManager.Application.Common.Interfaces.Services;
using BookManager.Domain.Enums;
using HtmlAgilityPack;
using UglyToad.PdfPig;
using VersOne.Epub;

namespace BookManager.Application.Indexing;

public sealed class IndexingService(IAppDbContext dbContext) : IIndexingService
{
    public async Task IndexDocumentAsync(Guid bookId, CancellationToken cancellationToken)
    {
        var document = await dbContext.Books.FindAsync([bookId], cancellationToken);
        if (document == null)
            throw new EntityNotFoundException();
        var documentTexts = ReadAllText(document.Filepath, document.FileType, document.Id);
        dbContext.BookTexts.AddRange(documentTexts);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> DeleteDocumentTextsAsync(Guid bookDocumentId, CancellationToken cancellationToken)
    {
        return await dbContext.BookTexts.Where(text => text.BookDocumentId == bookDocumentId)
            .ExecuteDeleteAsync(cancellationToken);
    }

    private static IEnumerable<BookText> ReadAllText(string filepath, BookFileType fileType, Guid bookId)
    {
        switch (fileType)
        {
            case BookFileType.Pdf:
                var document = PdfDocument.Open(filepath);
                return document.GetPages().Select(page => new BookText
                    {
                        BookDocumentId = bookId,
                        Text = page.Text,
                        PageNumber = page.Number
                    }
                ).ToList().AsEnumerable();
            case BookFileType.Epub:
                var book = EpubReader.ReadBook(filepath);
                var contents = book
                    .ReadingOrder
                    .Select(textContent => new BookText
                    {
                        BookDocumentId = bookId,
                        Text = PrintTextContentFile(textContent),
                    }).ToList();
                return contents.AsEnumerable();
            default:
                throw new ArgumentOutOfRangeException(nameof(fileType), fileType, null);
        }
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