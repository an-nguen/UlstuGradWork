using BookManager.Application.Common.DTOs;
using FluentValidation;

namespace BookManager.Application.Validators;

public class PageRequestValidator: AbstractValidator<PageRequestDto>
{
    public PageRequestValidator()
    {
        RuleFor(p => p.PageNumber).GreaterThan(0);
        RuleFor(p => p.PageSize).GreaterThan(0);
    }
}