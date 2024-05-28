using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace BookManager.Api.Controllers;

[ApiController]
[Route("word-dictionary")]
public class WordDictionaryController(IWordDictionaryService service) : ControllerBase
{
    [HttpGet]
    [Route("list-third-party-providers")]
    public IActionResult ListThirdPartyDictionaryProviderNames()
    {
        return Ok(service.GetThirdPartyProviderNames());
    }

    [HttpGet]
    [Route("{id}")]
    public async Task<IActionResult> FindAsync(string id, [FromQuery] string? providerName)
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
    [Route("third-party-dictionary/{id}")]
    public async Task<IActionResult> FindInThirdPartyDictionaryAsync(string id, [FromQuery] string providerName)
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
    public async Task<IActionResult> AddWordAsync([FromBody] WordDto word)
    {
        IActionResult result;
        try
        {
            var addedWord = await service.AddWordAsync(word);
            result = Ok(addedWord);
        }
        catch (ArgumentException e)
        {
            result = BadRequest(e.Message);
        }

        return result;
    }

    [HttpPut]
    [Route("{id}")]
    public async Task<IActionResult> UpdateWordAsync(string id, [FromBody] WordDto word)
    {
        IActionResult result;
        try
        {
            var updatedWord = await service.UpdateWordAsync(id, word);
            result = Ok(updatedWord);
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
    [Route("{id}")]
    public async Task<IActionResult> DeleteWordAsync(string id)
    {
        IActionResult result;
        try
        {
            await service.DeleteWordAsync(id);
            result = Ok();
        }
        catch (EntityNotFoundException)
        {
            result = NotFound();
        }

        return result;
    }
}