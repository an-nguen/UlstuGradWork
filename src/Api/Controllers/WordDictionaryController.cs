using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using BookManager.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace BookManager.Api.Controllers;

[ApiController]
[Route("word-dictionary")]
public class WordDictionaryController(
    IWordDictionaryService service,
    UserManager<User> userManager
    ) : ControllerBase
{
    [HttpGet]
    [Route("list-third-party-providers")]
    public IActionResult ListThirdPartyDictionaryProviderNames()
    {
        return Ok(service.GetThirdPartyProviderNames());
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetPage(
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromQuery] string sortBy = "word",
        [FromQuery] SortOrder sortOrder = SortOrder.Asc,
        [FromQuery] bool showFromOtherUsers = false
    )
    {
        var user = !showFromOtherUsers ? await userManager.GetUserAsync(HttpContext.User) : null;
        var pageRequest = new PageRequestDto(pageNumber, pageSize, sortBy, sortOrder);
        var page = await service.GetPageAsync(pageRequest, null, user);
        return Ok(page);
    }

    [HttpGet]
    [Authorize]
    [Route("{id}")]
    public async Task<IActionResult> FindAsync(string id)
    {
        IActionResult? result;
        try
        {
            var words = await service.FindAsync(id);
            result = Ok(words);
        }
        catch (ArgumentException)
        {
            result = BadRequest();
        }

        return result;
    }

    [HttpGet]
    [Authorize]
    [Route("third-party-dictionary/{id}")]
    public async Task<IActionResult> FindInThirdPartyDictionaryAsync(
        string id,
        [FromQuery] string providerName
    )
    {
        IActionResult? result;
        try
        {
            var words = await service.FindInExtDictAsync(id, providerName);
            result = Ok(words);
        }
        catch (NotAvailableException e)
        {
            result = StatusCode(StatusCodes.Status503ServiceUnavailable, e.Message);
        }
        catch (ArgumentException)
        {
            result = BadRequest();
        }

        return result;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddWordAsync([FromBody] WordDto word)
    {
        var user = await userManager.GetUserAsync(HttpContext.User);
        if (user == null) return Forbid();
        IActionResult result;
        try
        {
            var addedWord = await service.AddWordAsync(word, user);
            result = Ok(addedWord);
        }
        catch (ArgumentException e)
        {
            result = BadRequest(e.Message);
        }

        return result;
    }

    [HttpPut]
    [Authorize]
    [Route("{id}")]
    public async Task<IActionResult> UpdateWordAsync(string id, [FromBody] WordDto word)
    {
        var user = await userManager.GetUserAsync(HttpContext.User);
        if (user == null) return Forbid();
        IActionResult result;
        try
        {
            var updatedWord = await service.UpdateWordAsync(id, word, user);
            result = Ok(updatedWord);
        }
        catch (ForbiddenException)
        {
            result = Forbid();
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
    [Route("{id}")]
    public async Task<IActionResult> DeleteWordAsync(string id)
    {
        var user = await userManager.GetUserAsync(HttpContext.User);
        if (user == null) return Forbid();
        IActionResult result;
        try
        {
            await service.DeleteWordAsync(id, user);
            result = Ok();
        }
        catch (ForbiddenException)
        {
            result = Forbid();
        }
        catch (EntityNotFoundException)
        {
            result = NotFound();
        }

        return result;
    }
}