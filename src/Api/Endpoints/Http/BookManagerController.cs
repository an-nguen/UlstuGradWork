using BookManager.Application.Common.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace BookManager.Api.Endpoints.Http;

[ApiController]
[Route("books")]
public class BookManagerController(IBookDocumentService service) : ControllerBase
{
    [HttpGet]
    public IAsyncEnumerable<BookDocumentDto> GetAll() => service.GetAllAsync();

    [HttpGet]
    [Route("download/{id}")]
    public async Task<IActionResult> DownloadBookDocument(Guid id)
    {
        var bookDocument = await service.GetByIdAsync(id);
        if (bookDocument == null) return NotFound();
        var stream = await service.DownloadBookDocumentFileStreamAsync(id);
        return File(stream, bookDocument.GetContentType(), true);
    }
}