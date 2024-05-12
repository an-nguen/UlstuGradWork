using BookManager.Application.Common.DTOs;
using BookManager.Domain.Entities;
using BrunoZell.ModelBinding;
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
        var page = await service.GetPageAsync(new PageRequestDto(pageNumber, pageSize, sortBy, sortOrder), null, user);
        foreach (var item in page.Items)
        {
            item.DocumentDetails.ThumbnailUrl = GetImageUrl(item.DocumentDetails.Id);
        }

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
    [Route("search")]
    public Task<PageDto<BookDto>> Search([FromBody] SearchRequestDto request)
    {
        return searchService.SearchByBookDetailsAsync(request);
    }
    
    [HttpPost]
    [Route("full-text-search")]
    public Task<PageDto<BookTextDto>> Search([FromBody] TextSearchRequestDto request)
    {
        return searchService.SearchByBookTexts(request);
    }
    
    [HttpPost]
    [Authorize]
    public async Task<BookDto> AddBook([ModelBinder(BinderType = typeof(JsonModelBinder))] BookMetadataDto bookMetadata, IFormFile file)
    {
        return await service.AddBookAsync(file.OpenReadStream(), bookMetadata);
    }

    [HttpPost]
    [Authorize]
    [Route("{id:guid}/last-viewed-page")]
    public async Task<IActionResult> UpdateLastViewedPage(Guid id, [FromBody] LastViewedPageUpdateRequest request)
    {
        var user = await userManager.GetUserAsync(HttpContext.User);
        if (user == null) return BadRequest();
        await service.UpdateLastViewedPageAsync(request.PageNumber, user.Id, id);
        return Ok();
    }

    [HttpPut]
    [Authorize]
    [Route("{id:guid}")]
    public async Task<BookDto> UpdateBookDetails(Guid id, [FromBody] BookDetailsUpdateDto details)
    {
        return await service.UpdateBookDetailsAsync(id, details);
    }

    [HttpDelete]
    [Authorize]
    [Route("{id:guid}")]
    public async Task<IActionResult> DeleteBook(Guid id)
    {
        await service.DeleteBookAsync(id);
        return Ok();
    }

    private string GetImageUrl(Guid id)
    {
        return $"{Request.Scheme}://{Request.Host}{Request.PathBase}/books/cover/{id}";
    }
}