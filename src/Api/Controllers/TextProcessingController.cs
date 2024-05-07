using BookManager.Application.Common.DTOs;
using BookManager.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookManager.Api.Controllers;


[ApiController]
[Route("text-processing")]
public class TextProcessingController(ITranslationService translationService): ControllerBase
{
    [HttpPost]
    [Authorize]
    [Route("detect-language")]
    public async Task<IActionResult> DetectLanguage([FromBody] DetectLanguageRequestDto request)
    {
        return Ok(await translationService.DetectLanguageAsync(request));
    }
    
    [HttpPost]
    [Authorize]
    [Route("translate")]
    public async Task<IActionResult> Translate([FromBody] TranslationRequestDto request)
    {
        return Ok(await translationService.TranslateAsync(request));
    }
}