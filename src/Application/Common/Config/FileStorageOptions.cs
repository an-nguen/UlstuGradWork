namespace BookManager.Application.Common.Config;

public sealed class FileStorageOptions
{
    public const string FileStorage = "FileStorage";

    public string DirectoryPath { get; init; } = Constants.Default.DirectoryPath;

    public long MaxFileSizeInBytes { get; init; } = Constants.Default.MaxFileSize;
}