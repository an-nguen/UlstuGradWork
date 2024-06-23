using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public class FullTextSearchTreeEntryDto
{
    public Guid BookId { get; set; }

    public BookDto.Details? BookDetails { get; set; }

    public IEnumerable<BookTextDto> Texts { get; set; } = [];
}
