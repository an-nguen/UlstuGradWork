using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using BookManager.Application.Common.Interfaces.Services;

namespace BookManager.Application.Services;

internal class BookCollectionService(IAppDbContext dbContext) : IBookCollectionService
{
    public async Task<IEnumerable<BookCollectionDto>> GetAllAsync()
    {
        return await dbContext.BookCollections
            .Include(bc => bc.Books)
            .Select(bc => bc.ToDto())
            .ToListAsync();
    }

    public async Task<BookCollectionDto> CreateAsync(BookCollectionModRequest request)
    {
        if (string.IsNullOrEmpty(request.Name))
            throw new ArgumentException(nameof(request.Name));
        if (dbContext.BookCollections.Select(bc => bc.Name).Contains(request.Name))
            throw new ArgumentException("A book collection with this name already exists.", nameof(request));
        var existingBooks = request.Books is { Count: > 0 }
            ? await FilterBooksByIds(request.Books.Select(b => b.DocumentDetails.Id))
                .ToListAsync()
            : [];

        var newCollection = new BookCollection
        {
            Name = request.Name,
            Books = existingBooks
        };

        var entry = dbContext.BookCollections.Add(newCollection);
        await dbContext.SaveChangesAsync();
        return entry.Entity.ToDto();
    }

    public async Task<BookCollectionDto> UpdateAsync(Guid id, BookCollectionModRequest request)
    {
        if (string.IsNullOrEmpty(request.Name))
            throw new ArgumentException(nameof(request.Name));
        var isNameAlreadyExists = dbContext.BookCollections
            .Where(bc => bc.Id != id)
            .Select(bc => bc.Name)
            .Contains(request.Name);
        if (isNameAlreadyExists)
            throw new ArgumentException("A book collection with this name already exists.", nameof(request));

        var foundCollection =
            await dbContext.BookCollections
                .Include(bc => bc.Books)
                .FirstOrDefaultAsync(bc => bc.Id == id);
        if (foundCollection == null)
            throw new EntityNotFoundException();

        var existingBooks = request.Books is { Count: > 0 }
            ? await FilterBooksByIds(request.Books.Select(dto => dto.DocumentDetails.Id)).ToListAsync()
            : [];
        foundCollection.Name = request.Name;
        foundCollection.Books.Clear();
        foreach (var existingBook in existingBooks)
        {
            foundCollection.Books.Add(existingBook);
        }

        dbContext.BookCollections.Update(foundCollection);
        await dbContext.SaveChangesAsync();
        return foundCollection.ToDto();
    }

    public async Task DeleteAsync(Guid id)
    {
        var foundCollection = await dbContext.BookCollections.FindAsync(id);
        if (foundCollection == null) throw new EntityNotFoundException();

        dbContext.BookCollections.Remove(foundCollection);
        await dbContext.SaveChangesAsync();
    }

    private IQueryable<Book> FilterBooksByIds(IEnumerable<Guid> ids)
    {
        return dbContext.Books.Where(b => ids.Any(id => id == b.Id));
    }
}