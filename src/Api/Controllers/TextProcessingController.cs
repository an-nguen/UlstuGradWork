using BookManager.Application.Common.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookManager.Api.Controllers;


[ApiController]
[Route("text-processing")]
public class TextProcessingController(
    ITranslationService translationService,
    ITextSummarizationService textSummarizationService): ControllerBase
{
    [HttpGet]
    [Route("list-languages")]
    public async Task<IActionResult> ListLanguages()
    {
        return Ok(await translationService.ListLanguagesAsync());
    }
    
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

    [HttpPost]
    [Authorize]
    [Route("summarize-text")]
    public async Task<IActionResult> SummarizeText([FromBody] TextSummarizationRequestDto request)
    {
        return Ok(await textSummarizationService.SummarizeTextAsync(request));
    }
}