namespace BookManager.Application.Common.Exceptions;

public class InvalidFileHashException : Exception
{
    public InvalidFileHashException() : base("The file integrity hash is not valid!")
    {
    }
}