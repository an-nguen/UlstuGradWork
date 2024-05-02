using BookManager.Application.Common.DTOs;
using FluentValidation;

namespace BookManager.Application.Validators;

public class UserAddRequestValidator : AbstractValidator<UserAddRequest>
{
    public UserAddRequestValidator()
    {
        RuleFor(user => user.Name).NotEmpty().MinimumLength(2).MaximumLength(32);
        RuleFor(user => user.PinCode).Matches("^[0-9]{4,16}$").NotEmpty();
    }
}