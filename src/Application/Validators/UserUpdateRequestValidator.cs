using BookManager.Application.Common.DTOs;
using FluentValidation;

namespace BookManager.Application.Validators;

public class UserUpdateRequestValidator : AbstractValidator<UserUpdateRequest>
{
    public UserUpdateRequestValidator()
    {
        RuleFor(user => user.NewPINCode).Matches("^[0-9]{4,16}$").NotEmpty();
        RuleFor(user => user.CurrentPINCode).Matches("^[0-9]{4,16}$").NotEmpty();
    }
}
