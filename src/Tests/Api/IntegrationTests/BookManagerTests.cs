using Google.Protobuf;
using Google.Protobuf.WellKnownTypes;
using File = System.IO.File;

namespace BookManager.Tests.Api.IntegrationTests;

// [Collection("Api collection")]
// public class BookManagerTests
// {
//     private readonly ApiFixture _apiFixture;
//     private readonly Grpc.BookManager.BookManagerClient _client;
//
//     public BookManagerTests(ApiFixture fixture)
//     {
//         _apiFixture = fixture;
//         _client = new Grpc.BookManager.BookManagerClient(_apiFixture.Channel);
//     }
//
//     [Fact]
//     public async Task GetBookDocumentsTest()
//     {
//         await AddBookDocumentAsync(_client, Constants.TestFilepath);
//         await AddBookDocumentAsync(_client, Constants.AnotherTestFilepath);
//         using var call = _client.GetBookDocuments(new Empty());
//         var documents = await call.ResponseStream.ToListAsync();
//         Assert.NotNull(documents);
//         Assert.Equal(2, documents.Count);
//         _apiFixture.Cleanup();
//     }
//
//     [Fact]
//     public async Task DownloadBookDocumentFileTest()
//     {
//         var bookReply = await AddBookDocumentAsync(_client, Constants.TestFilepath);
//         Assert.NotEmpty(bookReply.Id);
//         using var call = _client.DownloadBookDocumentFile(new BookFileDownloadRequest { Id = bookReply.Id });
//         var hash = "";
//         await using (var fileStream = File.Create(bookReply.Id + ".pdf"))
//         {
//             await foreach (var dataChunk in call.ResponseStream.ReadAllAsync())
//             {
//                 hash = dataChunk.Hash;
//                 await fileStream.WriteAsync(dataChunk.Data.Memory);
//             }
//         }
//
//         Assert.Equal(FileUtils.ComputeHash(Constants.TestFilepath), hash);
//     }
//
//     [Fact]
//     public async Task AddBookDocumentTest()
//     {
//         var bookReply = await AddBookDocumentAsync(_client, Constants.TestFilepath);
//         Assert.NotEmpty(bookReply.Id);
//         _apiFixture.Cleanup();
//     }
//
//     [Fact]
//     public async Task UpdateBookDocumentDetailsTest()
//     {
//         const string titleText = "PDF Version 1.7 Specification";
//         var added = await AddBookDocumentAsync(_client, Constants.TestFilepath);
//         Assert.NotEmpty(added.Id);
//
//         var modified = await _client.UpdateBookDocumentDetailsAsync(new BookDocumentDetailsUpdateRequest
//             {
//                 Id = added.Id,
//                 Title = titleText
//             }
//         );
//         Assert.Equal(titleText, modified.Title);
//         _apiFixture.Cleanup();
//     }
//
//     [Fact]
//     public async Task ReplaceBookDocumentFileTest()
//     {
//         var added = await AddBookDocumentAsync(_client, Constants.TestFilepath);
//         Assert.NotEmpty(added.Id);
//
//         using var call = _client.ReplaceBookDocumentFile();
//         const string anotherTestFile = Constants.AnotherTestFilepath;
//         var fileInfo = new FileInfo(anotherTestFile);
//         var hash = FileUtils.ComputeHash(anotherTestFile);
//         await using var readStream = File.OpenRead(anotherTestFile);
//         var buffer = new byte[Constants.BufferSize];
//         int bytesRead;
//         while ((bytesRead = readStream.Read(buffer, 0, (int)Constants.BufferSize)) > 0)
//             await call.RequestStream.WriteAsync(new BookFileReplaceRequest
//             {
//                 Id = added.Id,
//                 Metadata = new FileMetadata
//                 {
//                     Name = fileInfo.Name,
//                     Size = fileInfo.Length,
//                     Hash = hash,
//                     Type = FileType.Pdf
//                 },
//                 Data = UnsafeByteOperations.UnsafeWrap(buffer.AsMemory(0, bytesRead))
//             });
//         await call.RequestStream.CompleteAsync();
//         var modified = await call.ResponseAsync;
//         Assert.Equal(hash, modified.FileHash);
//         Assert.Equal(added.Title, modified.Title);
//         _apiFixture.Cleanup();
//     }
//
//     [Fact]
//     public async Task RemoveBookDocumentTest()
//     {
//         var bookReply = await AddBookDocumentAsync(_client, Constants.TestFilepath);
//         Assert.NotEmpty(bookReply.Id);
//         var ex = await Record.ExceptionAsync(DeleteTest);
//         Assert.Null(ex);
//         _apiFixture.Cleanup();
//         return;
//
//         Task DeleteTest()
//         {
//             return Task.Run(() => _client.RemoveBookDocumentAsync(new BookRemoveRequest { Id = bookReply.Id }));
//         }
//     }
//
//     public static async Task<BookReply> AddBookDocumentAsync(Grpc.BookManager.BookManagerClient client, string filepath)
//     {
//         using var call = client.AddBookDocumentFile();
//         var fileInfo = new FileInfo(filepath);
//         var hash = FileUtils.ComputeHash(fileInfo.FullName);
//         await using var readStream = File.OpenRead(fileInfo.FullName);
//         var buffer = new byte[Constants.BufferSize];
//         int bytesRead;
//         while ((bytesRead = readStream.Read(buffer, 0, (int)Constants.BufferSize)) > 0)
//             await call.RequestStream.WriteAsync(new BookFileAddRequest
//             {
//                 FileMetadata = new FileMetadata
//                 {
//                     Name = fileInfo.Name,
//                     Size = fileInfo.Length,
//                     Hash = hash,
//                     Type = FileType.Pdf
//                 },
//                 Data = UnsafeByteOperations.UnsafeWrap(buffer.AsMemory(0, bytesRead))
//             });
//         await call.RequestStream.CompleteAsync();
//
//         return await call.ResponseAsync;
//     }
// }