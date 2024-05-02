using BookManager.Domain.Exceptions;

namespace BookManager.Domain.Enums;

public enum DocumentFileType
{
    Pdf,
    Epub
}

public static class DocumentFileTypeUtils
{
    public static DocumentFileType GetFileType(string filename)
        => Path.GetExtension(filename).ToLower() switch
        {
            ".pdf" => DocumentFileType.Pdf,
            ".epub" => DocumentFileType.Epub,
            _ => throw new UnsupportedFileTypeException()
        };
}