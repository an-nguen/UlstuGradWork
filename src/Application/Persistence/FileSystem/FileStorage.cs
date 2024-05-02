using System.Buffers;
using Blake3;
using BookManager.Application.Common.Config;
using BookManager.Application.Common.Interfaces;
using Microsoft.Extensions.Options;

namespace BookManager.Application.Persistence.FileSystem;

public sealed class FileStorage : IFileStorage, IDisposable
{
    private const int FileChunkBufferSize = 8192;
    private readonly FileStorageOptions _options;
    private Hasher _hasher;

    public FileStorage(IOptions<FileStorageOptions> options)
    {
        _options = options.Value;
        _hasher = Hasher.New();
        InitDirectory();
    }

    public async IAsyncEnumerable<byte[]> ReadFileAsync(string filename)
    {
        await using var stream = File.OpenRead(filename);
        var pool = MemoryPool<byte>.Shared.Rent(FileChunkBufferSize);
        while (await stream.ReadAsync(pool.Memory) > 0)
        {
            yield return pool.Memory.ToArray();
        }
        
    }

    public string GetFileHash(string filename)
    {
        _hasher.Reset();
        _hasher.Update(File.ReadAllBytes(filename));
        return _hasher.Finalize().ToString();
    }

    public async Task<FileInfo> SaveFileAsync(string filename, Stream stream)
    {
        var filepath = Path.Combine(_options.DirectoryPath, filename);
        await using (var file = File.Create(filepath))
        {
            stream.Seek(0, SeekOrigin.Begin);
            await stream.CopyToAsync(file);
        }

        return new FileInfo(filepath);
    }

    public void DeleteFile(string filename)
    {
        File.Delete(filename);
    }

    private void InitDirectory()
    {
        Directory.CreateDirectory(_options.DirectoryPath);
    }

    public void Dispose()
    {
        _hasher.Dispose();
    }
}