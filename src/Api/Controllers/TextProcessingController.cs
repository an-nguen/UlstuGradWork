using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BookManager.Api.Controllers;


[ApiController]
[Route("text-processing")]
public class TextProcessingController(ITranslationService translationService): ControllerBase
{
    [HttpPost]
    [Route("translate")]
    public async Task<IActionResult> Translate([FromBody] TranslationRequestDto request)
    {
        return Ok(await translationService.TranslateAsync(request));
    }
}