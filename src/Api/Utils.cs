namespace BookManager.Api;

public static class Utils
{
    public static Guid ParseGuid(string? uuidStr)
    {
        if (string.IsNullOrEmpty(uuidStr))
            throw new FormatException("An id field in request is null or empty.");
        return Guid.Parse(uuidStr);
    }
}