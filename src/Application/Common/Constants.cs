namespace BookManager.Application.Common;

public static class Constants
{
    public static class Default
    {
        public const string DirectoryPath = "./";

        public const int IndexingQueueCapacity = 2;

        // 256 MiB in Bytes
        public const long MaxFileSize = 268_435_456L;

        // JWT options
        public const string Issuer = "https://localhost:7013";
        public const string Audience = "http://localhost:4200";
        public const uint AccessTokenLifetimeInMinutes = 15;
        public const uint RefreshTokenLifetimeInMinutes = 1440;

        public static class Dictionary
        {
            public const string RapidApiHost = "wordsapiv1.p.rapidapi.com";
            public const string BaseUrl = "https://wordsapiv1.p.rapidapi.com";
            public const string DefinitionUrl = "/words/incredible/definitions";
            public const string InfoUrl = "/words";
        }
    }

    public const string RefreshTokenCookieKey = "refresh_token";

    public const int ThumbnailPreviewWidth = 600;
    public const int ThumbnailPreviewHeight = 800;
}