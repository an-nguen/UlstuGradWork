using BookManager.Domain.Exceptions;
using Tapper;

namespace BookManager.Domain.Enums;

[TranspilationSource]
public enum BookFileType
{
    Pdf,
    Epub
}

public static class DocumentFileTypeUtils
{
    public static BookFileType GetFileType(string filename)
        => Path.GetExtension(filename).ToLower() switch
        {
            ".pdf" => BookFileType.Pdf,
            ".epub" => BookFileType.Epub,
            _ => throw new UnsupportedFileTypeException()
        };
}