﻿using System.Linq.Expressions;
using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public sealed record PageRequestDto(
    int PageNumber, 
    int PageSize, 
    string? SortBy = null, 
    SortOrder SortOrder = SortOrder.Asc);

[TranspilationSource]
public enum SortOrder
{
    Asc,
    Desc
}