namespace BookManager.Application.Common;

public static class Constants
{
    public static class Default
    {
        public const string DirectoryPath = "./";

        public const int IndexingQueueCapacity = 2;
        
        // 256 MiB in Bytes
        public const long MaxFileSize = 268435456L;

        // JWT options
        public const string Issuer = "https://localhost:7013";
        public const string Audience = "http://localhost:4200";
        public const uint AccessTokenLifetimeInMinutes = 5;
        public const uint RefreshTokenLifetimeInMinutes = 60;
    }

    public const string RefreshTokenCookieKey = "refresh_token";
}