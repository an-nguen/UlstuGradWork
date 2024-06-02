using BookManager.Application.Common.Exceptions;
using BookManager.Application.Common.Interfaces;
using BookManager.Application.Common.Interfaces.Services;

namespace BookManager.Application.Indexing;

public sealed class IndexingService(
    IAppDbContext dbContext,
    IEnumerable<IBookFileHandler> bookFileHandlers,
    IFileStorage storage
) : IIndexingService
{
    private const int MaxPageCountToSave = 100;

    public async Task IndexDocumentAsync(Guid bookId, CancellationToken cancellationToken)
    {
        var book = await dbContext.Books.FindAsync([bookId], cancellationToken);
        if (book == null)
            throw new EntityNotFoundException();
        var fileStream = storage.GetFileStream(book.Filename);
        foreach (var bookFileHandler in bookFileHandlers)
        {
            if (bookFileHandler.FileType != book.FileType) continue;

            var count = 0;
            await foreach (var bookText in bookFileHandler.StreamBookTexts(book.Id, fileStream)
                               .WithCancellation(cancellationToken))
            {
                if (count >= MaxPageCountToSave)
                {
                    count = 0;
                    await dbContext.SaveChangesAsync(cancellationToken);
                }

                dbContext.BookTexts.Add(bookText);
                count++;
            }

            break;
        }

        await fileStream.DisposeAsync();
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> DeleteDocumentTextsAsync(Guid bookDocumentId, CancellationToken cancellationToken)
    {
        return await dbContext.BookTexts
            .Where(text => text.BookDocumentId == bookDocumentId)
            .ExecuteDeleteAsync(cancellationToken);
    }
}