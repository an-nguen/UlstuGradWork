using System.Linq.Expressions;
using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using BookManager.Application.Common.Interfaces.Services;
using FluentValidation;
using NodaTime;

namespace BookManager.Application.Services;

internal sealed class DictionaryService(
    IAppDbContext dbContext,
    IEnumerable<IThirdPartyDictionaryProvider> extDictProvider,
    IValidator<WordDto> validator
) : IWordDictionaryService
{
    private static readonly Dictionary<string, Expression<Func<DictionaryWord, object>>> SortOptions = new()
    {
        ["word"] = b => b.Word,
    };

    public async Task<PageDto<WordDto>> GetPageAsync(
        PageRequestDto request,
        Expression<Func<DictionaryWord, bool>>? predicate = null,
        User? user = null
    )
    {
        int normalizedPageNumber = PageDto<WordDto>.GetNormalizedPageNumber(request.PageNumber);
        var query = dbContext.DictionaryWords.AsQueryable();
        var totalItemCount = await query.CountAsync();

        if (predicate != null)
            query = query.Where(predicate);
        if (user != null)
            query = query.Where(wordDefinition => wordDefinition.UserId == user.Id);

        if (!string.IsNullOrEmpty(request.SortBy) && SortOptions.TryGetValue(request.SortBy, out var expr))
        {
            query = request.SortOrder == SortOrder.Asc ? query.OrderBy(expr) : query.OrderByDescending(expr);
        }

        query = query.Skip((normalizedPageNumber - 1) * request.PageSize)
            .Take(request.PageSize);
        var pageCount = PageDto<WordDto>.CountPage(totalItemCount, request.PageSize);
        var items = await query.Select(entity => entity.ToDto())
            .ToListAsync();
        return PageDto<WordDto>.Builder.Create()
            .SetPageNumber(normalizedPageNumber)
            .SetPageSize(items.Count)
            .SetTotalItemCount(totalItemCount)
            .SetPageCount(pageCount)
            .SetItems(items)
            .Build();
    }

    public IEnumerable<string> GetThirdPartyProviderNames()
    {
        return extDictProvider.Select(provider => provider.ProviderName).ToList();
    }

    public async Task<IEnumerable<WordDto>> FindAsync(string word)
    {
        return await dbContext.DictionaryWords
            .Where(w => w.Word == word || w.Stems == null || w.Stems.Any(s => EF.Functions.Like(s, $"%{word}%")))
            .Select(w => w.ToDto())
            .ToListAsync();
    }

    public async Task<IEnumerable<WordDto>> FindInExtDictAsync(string word, string thirdPartyProviderName)
    {
        var provider = extDictProvider.FirstOrDefault(provider => provider.ProviderName == thirdPartyProviderName)
                       ?? throw new ArgumentException(null, nameof(thirdPartyProviderName));
        return await provider.GetDefinitionAsync(word);
    }

    public async Task<WordDto> AddWordAsync(WordDto word, User user)
    {
        var validationResult = await validator.ValidateAsync(word);
        if (!validationResult.IsValid) throw new ArgumentException("The word validation failed.", nameof(word));
        var convertedDto = word.ToEntity();
        convertedDto.UserId = user.Id;
        var entry = dbContext.DictionaryWords.Add(convertedDto);
        await dbContext.SaveChangesAsync();
        return entry.Entity.ToDto();
    }

    public async Task<WordDto> UpdateWordAsync(string wordId, WordDto word, User user)
    {
        var validationResult = await validator.ValidateAsync(word);
        if (!validationResult.IsValid) throw new ArgumentException("The word validation failed.", nameof(word));
        var foundEntity = await dbContext.DictionaryWords.FindAsync(wordId)
                          ?? throw new EntityNotFoundException();
        if (foundEntity.UserId != user.Id) throw new ForbiddenException();
        foundEntity.Transcription = word.Transcription;
        foundEntity.LanguageCode = word.LanguageCode;
        foundEntity.Definitions.Clear();
        foreach (var wordDef in word.Definitions)
        {
            foundEntity.Definitions.Add(wordDef.ToEntity());
        }
        foundEntity.UpdatedAt = SystemClock.Instance.GetCurrentInstant();

        var entry = dbContext.DictionaryWords.Update(foundEntity);
        await dbContext.SaveChangesAsync();
        return entry.Entity.ToDto();
    }

    public async Task DeleteWordAsync(string word, User user)
    {
        var foundEntity = await dbContext.DictionaryWords.FindAsync(word) ?? throw new EntityNotFoundException();
        if (foundEntity.UserId != user.Id) throw new ForbiddenException();
        dbContext.DictionaryWords.Remove(foundEntity);
        await dbContext.SaveChangesAsync();
    }
}