namespace BookManager.Api.Exceptions;

public class InvalidArgumentGrpcException(string message)
    : RpcException(new Status(StatusCode.InvalidArgument, message));