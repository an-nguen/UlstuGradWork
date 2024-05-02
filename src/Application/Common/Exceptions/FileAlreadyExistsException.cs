namespace BookManager.Application.Common.Exceptions;

public class FileAlreadyExistsException : Exception
{
    public FileAlreadyExistsException() : base("The file already exists!")
    {
    }
}