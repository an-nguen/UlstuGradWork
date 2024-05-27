using BookManager.Application.Common.DTOs;
using FluentValidation;

namespace BookManager.Application.Validators;

public class WordDtoValidator: AbstractValidator<WordDto>
{
    public WordDtoValidator()
    {
        RuleFor(w => w.Word).Matches("\\p{L}*[ -]*").NotEmpty();
    }
}