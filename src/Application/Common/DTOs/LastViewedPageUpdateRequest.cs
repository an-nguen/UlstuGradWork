using Tapper;

namespace BookManager.Application.Common.DTOs;

[TranspilationSource]
public record LastViewedPageUpdateRequest(int PageNumber);