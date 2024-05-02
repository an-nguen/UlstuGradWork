namespace BookManager.Application.Common.Exceptions;

public class MaxFileSizeException : Exception
{
    public MaxFileSizeException() : base("The maximum file size has been exceeded.")
    {
    }
}