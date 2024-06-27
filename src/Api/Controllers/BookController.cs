using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using BookManager.Domain.Entities;
using BrunoZell.ModelBinding;
using LinqKit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace BookManager.Api.Controllers;

[ApiController]
[Route("books")]
public class BookController(
    IBookService service,
    ISearchService searchService,
    UserManager<User> userManager)
    : ControllerBase
{
    [HttpGet]
    [Authorize]
    public async Task<PageDto<BookDto>> GetBooks(
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromQuery] string? sortBy = null,
        [FromQuery] SortOrder sortOrder = SortOrder.Asc
    )
    {
        var user = await userManager.GetUserAsync(HttpContext.User);
        var pageRequest = new PageRequestDto(pageNumber, pageSize, sortBy, sortOrder);
        var page = await service.GetPageAsync(pageRequest, null, user);
        page.Items.ForEach(p =>
        {
            p.DocumentDetails.ThumbnailUrl = GetImageUrl(p.DocumentDetails.Id);
        });

        return page;
    }

    [HttpGet]
    [Authorize]
    [Route("download/{id:guid}")]
    public async Task<IActionResult> DownloadBook(Guid id)
    {
        var user = await userManager.GetUserAsync(HttpContext.User);
        if (user == null) return BadRequest();
        var bookDto = await service.GetByIdAsync(id);
        if (bookDto == null) return NotFound();
        var stream = await service.GetBookFileStreamAsync(id, user);
        return File(stream, bookDto.GetContentType(), true);
    }

    [HttpGet]
    [Route("cover/{id:guid}")]
    public async Task<IActionResult> GetBookCover(Guid id)
    {
        var imageStream = await service.GetBookCoverImageFileStream(id);
        if (imageStream == null) return Ok(null);
        return File(imageStream, "image/jpeg");
    }

    [HttpGet]
    [Authorize]
    [Route("{id:guid}")]
    public async Task<IActionResult> GetBookById(Guid id)
    {
        var user = await userManager.GetUserAsync(HttpContext.User);
        var bookDto = await service.GetByIdAsync(id, user?.Id);
        if (bookDto == null)
            return NotFound();
        return Ok(bookDto);
    }

    [HttpPost]
    [Authorize]
    [Route("search")]
    public async Task<PageDto<BookDto>> Search([FromBody] SearchRequestDto request)
    {
        var user = await userManager.GetUserAsync(HttpContext.User);
        var page = await searchService.SearchByBookDetailsAsync(request, user);
        foreach (var item in page.Items)
        {
            item.DocumentDetails.ThumbnailUrl = GetImageUrl(item.DocumentDetails.Id);
        }

        return page;
    }

    [HttpPost]
    [Authorize]
    [Route("full-text-search")]
    public async Task<IActionResult> SearchByText([FromBody] TextSearchRequestDto request)
    {
        var tree = await searchService.SearchByBookTextsAsync(request);
        return Ok(tree);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddBook([ModelBinder(BinderType = typeof(JsonModelBinder))] BookMetadataDto bookMetadata,
        IFormFile file)
    {
        await using var stream = file.OpenReadStream();
        var user = await userManager.GetUserAsync(HttpContext.User);
        if (user == null) return Forbid();
        return Ok(await service.AddBookAsync(stream, bookMetadata, user.Id));
    }

    [HttpPost]
    [Authorize]
    [Route("tickets")]
    public async Task<IActionResult> CreateTicket()
    {
        var user = await userManager.GetUserAsync(HttpContext.User);
        if (user == null) return Forbid();
        var ticket = await service.CreateTicketAsync(user.Id);
        return Ok(ticket);
    }

    [HttpPost]
    [Authorize]
    [Route("{bookId:guid}/update-total-time")]
    public async Task<IActionResult> UpdateTotalTime(Guid bookId, [FromBody] TotalTimeUpdateRequestDto updateRequest)
    {
        await service.UpdateTotalTimeAsync(bookId, updateRequest.TicketId, updateRequest.Seconds);
        return Ok();
    }

    [HttpPost]
    [Authorize]
    [Route("{bookId:guid}/last-viewed-page")]
    public async Task<IActionResult> UpdateLastViewedPage(Guid bookId, [FromBody] LastViewedPageUpdateRequest request)
    {
        var user = await userManager.GetUserAsync(HttpContext.User);
        if (user == null) return Forbid();
        await service.UpdateLastViewedPageAsync(request.PageNumber, user.Id, bookId);
        return Ok();
    }

    [HttpPut]
    [Authorize]
    [Route("{id:guid}")]
    public async Task<IActionResult> UpdateBookDetails(Guid id, [FromBody] BookDetailsUpdateDto details)
    {
        var user = await userManager.GetUserAsync(HttpContext.User);
        if (user == null) return Forbid();
        IActionResult result;
        try
        {
            var updatedBook = await service.UpdateBookDetailsAsync(id, details, user.Id);
            result = Ok(updatedBook);
        }
        catch (ForbiddenException)
        {
            result = Forbid();
        }
        return result;
    }

    [HttpDelete]
    [Authorize]
    [Route("{id:guid}")]
    public async Task<IActionResult> DeleteBook(Guid id)
    {
        var user = await userManager.GetUserAsync(HttpContext.User);
        if (user == null) return Forbid();
        IActionResult result;
        try
        {
            await service.DeleteBookAsync(id, user.Id);
            result = Ok();
        }
        catch (ForbiddenException)
        {
            result = Forbid();
        }
        return result;
    }

    private string GetImageUrl(Guid id)
    {
        return $"{Request.Scheme}://{Request.Host}{Request.PathBase}/books/cover/{id}";
    }
}