using BookManager.Domain.Enums;

namespace BookManager.Application.Indexing;

public enum IndexingWorkItemOperationType
{
    Created,
    Replaced,
    Deleted
}

public sealed record IndexingWorkItem(
    IndexingWorkItemOperationType OperationType,
    Guid BookDocumentId,
    string Filepath,
    DocumentFileType FileType
);