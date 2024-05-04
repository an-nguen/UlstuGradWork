using BookManager.Application.Common.DTOs;
using BrunoZell.ModelBinding;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookManager.Api.Controllers;

[ApiController]
[Route("books")]
public class BookController(IBookService service) : ControllerBase
{
    [HttpGet]
    [Authorize]
    public IAsyncEnumerable<BookDto> GetBooks([FromQuery] int pageNumber, [FromQuery] int pageSize) 
        => service.GetPage(pageNumber, pageSize);

    [HttpGet]
    [Route("download/{id:guid}")]
    public async Task<IActionResult> DownloadBook(Guid id)
    {
        var bookDto = await service.GetByIdAsync(id);
        if (bookDto == null) return NotFound();
        var stream = await service.DownloadBookFileStreamAsync(id);
        return File(stream, bookDto.GetContentType(), true);
    }

    [HttpGet]
    [Route("{id:guid}")]
    public async Task<IActionResult> GetBookById(Guid id)
    {
        var bookDto = await service.GetByIdAsync(id);
        if (bookDto == null)
            return NotFound();
        return Ok(bookDto);
    }

    [HttpPost]
    [Authorize]
    public async Task<BookDto> AddBook([ModelBinder(BinderType = typeof(JsonModelBinder))] BookMetadataDto bookMetadata, IFormFile file)
    {
        return await service.AddBookAsync(file.OpenReadStream(), bookMetadata);
    }

    [HttpPut]
    [Route("{id:guid}")]
    [Authorize]
    public async Task<BookDto> UpdateBookDetails(Guid id, [FromBody] BookDto.Details details)
    {
        return await service.UpdateBookDetailsAsync(id, details);
    }

    [HttpDelete]
    [Route("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteBook(Guid id)
    {
        await service.DeleteBookAsync(id);
        return Ok();
    }
}