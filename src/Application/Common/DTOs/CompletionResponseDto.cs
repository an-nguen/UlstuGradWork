namespace BookManager.Application.Common.DTOs;

public sealed class CompletionResponseDto
{
    public ResponseResult Result { get; set; } = null!;

    public class ResponseResult
    {
        public IEnumerable<Alternative> Alternatives { get; set; } = [];
        public TokensUsage? Usage { get; set; }
        public string? ModelVersion { get; set; }

        public class Alternative
        {
            public AMessage Message { get; set; } = null!;
            public string? Status { get; set; }

            public record AMessage(string Role, string Text);
        }

        public record TokensUsage(string InputTextTokens, string CompletionTokens, string TotalTokens);
    }
}
