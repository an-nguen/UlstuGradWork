namespace BookManager.Application.Common;

public static class Constants
{
    public static readonly string[] SupportedDocumentFileExtensions = [".pdf", ".epub"];

    public const string HostnameRegex =
        @"^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$"; 

    public static class PropertyName
    {
        public const string ConnectionString = "Main";
        public const string DbPassword = "DbPassword";
        public const string PreSharedKey = "PreSharedKey";
    }

    public static class Default
    {
        public const string DirectoryPath = "./";

        // 256 MiB in Bytes
        public const long MaxFileSize = 268435456L;
        
        public const int IndexingQueueCapacity = 2;
    }
}