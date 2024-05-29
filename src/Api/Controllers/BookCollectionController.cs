using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookManager.Api.Controllers;

[ApiController]
[Route("book-collections")]
public class BookCollectionController(IBookCollectionService service) : ControllerBase
{
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var allCollections = await service.GetAllAsync();
        foreach (var collection in allCollections)
        {
            UpdateThumbnailUrls(collection);
        }

        return Ok(allCollections);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateCollection([FromBody] BookCollectionModRequest request)
    {
        IActionResult result;
        try
        {
            var addedCollection = await service.CreateAsync(request);
            UpdateThumbnailUrls(addedCollection);
            result = Ok(addedCollection);
        }
        catch (ArgumentException e)
        {
            result = BadRequest(e.Message);
        }

        return result;
    }

    [HttpPut]
    [Authorize]
    [Route("{id:guid}")]
    public async Task<IActionResult> UpdateCollection(Guid id, [FromBody] BookCollectionModRequest request)
    {
        IActionResult result;
        try
        {
            var addedCollection = await service.UpdateAsync(id, request);
            UpdateThumbnailUrls(addedCollection);
            result = Ok(addedCollection);
        }
        catch (ArgumentException e)
        {
            result = BadRequest(e.Message);
        }
        catch (EntityNotFoundException)
        {
            result = NotFound();
        }

        return result;
    }

    [HttpDelete]
    [Authorize]
    [Route("{id:guid}")]
    public async Task<IActionResult> DeleteAsync(Guid id)
    {
        try
        {
            await service.DeleteAsync(id);
        }
        catch (EntityNotFoundException)
        {
            return NotFound();
        }

        return Ok();
    }

    private void UpdateThumbnailUrls(BookCollectionDto dto)
    {
        if (dto.Books == null) return;
        foreach (var book in dto.Books)
        {
            book.DocumentDetails.ThumbnailUrl = GetImageUrl(book.DocumentDetails.Id);
        }
    }

    private string GetImageUrl(Guid id)
    {
        return $"{Request.Scheme}://{Request.Host}{Request.PathBase}/books/cover/{id}";
    }
}