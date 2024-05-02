using Blake3;

namespace BookManager.Tests;

public static class FileUtils
{
    public static string ComputeHash(string filepath, int bufferSize = 4096 * 32)
    {
        using var fs = File.OpenRead(filepath);
        using var hasher = Hasher.New();
        var buffer = new byte[bufferSize];
        int bytesRead;
        while ((bytesRead = fs.Read(buffer, 0, buffer.Length)) != 0)
        {
            hasher.Update(buffer.AsSpan(0, bytesRead));
        }
        return hasher.Finalize().ToString();
    }
}