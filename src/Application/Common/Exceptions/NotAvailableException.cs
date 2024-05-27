namespace BookManager.Application.Common.Exceptions;

public class NotAvailableException(string message): Exception($"NotAvailableException: {message}");