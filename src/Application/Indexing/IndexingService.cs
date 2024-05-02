using System.Text;
using BookManager.Application.Common.Exceptions;
using BookManager.Application.Common.Interfaces.Services;
using BookManager.Application.Persistence.Commands;
using BookManager.Application.Persistence.Queries;
using BookManager.Domain.Enums;
using HtmlAgilityPack;
using UglyToad.PdfPig;
using VersOne.Epub;

namespace BookManager.Application.Indexing;

public sealed class IndexingService(ISender sender) : IIndexingService
{
    public async Task IndexDocumentAsync(Guid bookDocumentId, CancellationToken cancellationToken)
    {
        var document = await sender.Send(new GetBookDocumentByIdQuery(bookDocumentId), cancellationToken);
        if (document == null)
            throw new EntityNotFoundException();
        var documentTexts = ReadAllText(document.Filepath, document.FileType, document.Id);
        await sender.Send(new AddDocumentTextsCommand
        {
            DocumentTexts = documentTexts
        }, cancellationToken);
    }

    public async Task<int> DeleteDocumentTextsAsync(Guid bookDocumentId, CancellationToken cancellationToken)
    {
        return await sender.Send(new DeleteDocumentTextsCommand(bookDocumentId), cancellationToken);
    }

    private static IEnumerable<BookDocumentText> ReadAllText(string filepath, DocumentFileType fileType, Guid bookId)
    {
        switch (fileType)
        {
            case DocumentFileType.Pdf:
                var document = PdfDocument.Open(filepath);
                return document.GetPages().Select(page => new BookDocumentText
                    {
                        BookDocumentId = bookId,
                        Text = page.Text,
                        PageNumber = page.Number
                    }
                ).ToList().AsEnumerable();
            case DocumentFileType.Epub:
                var book = EpubReader.ReadBook(filepath);
                var contents = book
                    .ReadingOrder
                    .Select(textContent => new BookDocumentText
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