namespace BookManager.Application.Common.Config;

public sealed class DictionaryOptions
{
    public const string Dictionary = "Dictionary";

    public required string RapidApiKey { get; init; }
    public string RapidApiHost { get; init; } = Constants.Default.Dictionary.RapidApiHost;
    public string BaseUrl { get; init; } = Constants.Default.Dictionary.BaseUrl;
    public string DefinitionUrl { get; init; } = Constants.Default.Dictionary.DefinitionUrl;
    public string InfoUrl { get; init; } = Constants.Default.Dictionary.InfoUrl;
}