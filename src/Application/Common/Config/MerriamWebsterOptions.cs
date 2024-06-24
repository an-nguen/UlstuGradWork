namespace BookManager.Application.Common.Config;

public class MerriamWebsterOptions
{
    public const string MerriamWebster = "MerriamWebster";

    public string? ApiKey { get; init; }
    public string? ApiKeyFile { get; init; }
}