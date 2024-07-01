using System.Linq.Expressions;
using BookManager.Application.Common.DTOs;

namespace BookManager.Application.Common.Interfaces.Services;

public interface IPageableService<TEntity, TDtoEntity>
    where TEntity : class
    where TDtoEntity : class
{
    public Task<PageDto<TDtoEntity>> GetPageAsync(
        PageRequestDto request,
        Expression<Func<TEntity, bool>>? predicate = null,
        User? user = null
    );
}