namespace BookManager.Application.Common.Exceptions;

public class UserCreationException(string message): Exception(message);
public class UserUpdateException(string message): Exception(message);
