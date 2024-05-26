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
        var addedWord = await service.AddWord(word);
        return Ok(addedWord);
    }

    [HttpPut]
    [Route("{id}")]
    public async Task<IActionResult> UpdateWord(string id, [FromBody] WordDto word)
    {
        var updatedWord = await service.UpdateWord(id, word);
        return Ok(updatedWord);
    }

    [HttpDelete]
    [Route("{id}")]
    public async Task<IActionResult> DeleteWord(string id)
    {
        try
        {
            await service.DeleteWord(id);
            return Ok();
        }
        catch (EntityNotFoundException)
        {
            return NotFound();
        }
    } 
}