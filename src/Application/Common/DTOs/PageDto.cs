using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public record PageDto<T>
{
    public IEnumerable<T> Items { get; set; } = new List<T>();
    public int PageSize { get; set; }
    public int PageNumber { get; set; }
    public int PageCount { get; set; }
    public int TotalItemCount { get; set; }
    
    // Returns a page number in a range from 1 to infinity
    public static int GetNormalizedPageNumber(int pageNumber)
    {
        return pageNumber <= 0 ? 1 : pageNumber;
    }

    public static int CountPage(int totalItemCount, int pageSize)
    {
        return totalItemCount / pageSize + (totalItemCount % pageSize > 0 ? 1 : 0);
    }
    
    public sealed class Builder
    {
        private readonly PageDto<T> _pageDto = new();
        
        private Builder() {}

        public static Builder Create()
        {
            return new Builder();
        }
        
        public Builder SetItems(IEnumerable<T> items)
        {
            _pageDto.Items = items;
            return this;
        }

        public Builder SetPageSize(int pageSize)
        {
            _pageDto.PageSize = pageSize;
            return this;
        }
        
        public Builder SetPageNumber(int pageNumber)
        {
            _pageDto.PageNumber = pageNumber;
            return this;
        }

        public Builder SetPageCount(int pageCount)
        {
            _pageDto.PageCount = pageCount;
            return this;
        }
        
        public Builder SetTotalItemCount(int totalItemCount)
        {
            _pageDto.TotalItemCount = totalItemCount;
            return this;
        }
        
        public PageDto<T> Build()
        {
            return _pageDto;
        }
    }
}

