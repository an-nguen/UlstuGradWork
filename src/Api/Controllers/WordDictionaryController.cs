using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace BookManager.Api.Controllers;

[ApiController]
[Route("word-dictionary")]
public class WordDictionaryController(IWordDictionaryService service) : ControllerBase
{
    [HttpGet]
    [Route("{id}")]
    public async Task<IActionResult> Find(string id)
    {
        var word = await service.Find(id);
        if (word == null) return NotFound(id);
        return Ok(word);
    }

    [HttpPost]
    public async Task<IActionResult> AddWord([FromBody] WordDto word)
    {
        IActionResult result;
        try
        {
            var addedWord = await service.AddWord(word);
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
    public async Task<IActionResult> UpdateWord(string id, [FromBody] WordDto word)
    {
        IActionResult result;
        try
        {
            var updatedWord = await service.UpdateWord(id, word);
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
    public async Task<IActionResult> DeleteWord(string id)
    {
        IActionResult result;
        try
        {
            await service.DeleteWord(id);
            result = Ok();
        }
        catch (EntityNotFoundException)
        {
            result = NotFound();
        }

        return result;
    }
}