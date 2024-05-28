using System.ComponentModel.DataAnnotations;

namespace BookManager.Domain.Entities;

public class DictionaryWordAlias
{
    [Key]
    public string Alias { get; init; } = null!;

    public DictionaryWord DictionaryWord { get; init; } = null!;
}