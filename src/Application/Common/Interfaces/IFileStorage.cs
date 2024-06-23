namespace BookManager.Application.Common.Interfaces;

public interface IFileStorage
{
    Task<FileInfo> SaveFileAsync(string filename, Stream stream);

    FileStream GetFileStream(string filename);

    IAsyncEnumerable<byte[]> ReadFileAsync(string filename);

    string GetFileHash(string filename);

    void DeleteFile(string filename, string? thumbnailFilename);
}