using Xunit.Abstractions;

namespace BookManager.Tests.Api.IntegrationTests;

// [Collection("Api collection")]
// public class SearchTests(ApiFixture apiFixture, ITestOutputHelper testOutputHelper)
// {
//     private readonly Grpc.BookManager.BookManagerClient _bookManagerClient = new(apiFixture.Channel);
//     private readonly Search.SearchClient _client = new(apiFixture.Channel);
//
//     private readonly Notification.NotificationClient _notificationClient = new(apiFixture.Channel);
//
//     [Fact]
//     public async Task SearchTextTest()
//     {
//         var bookReply = await BookManagerTests.AddBookDocumentAsync(_bookManagerClient, Constants.TestFilepath);
//         Assert.NotEmpty(bookReply.Id);
//         using (var notificationStreamCall = _notificationClient.Subscribe(new DeviceInfo
//                {
//                    Hostname = "DEVICE0",
//                    MacAddress = "26:cd:63:6d:a6:af"
//                }))
//         {
//             if (await notificationStreamCall.ResponseStream.ReadAllAsync().AnyAsync(result =>
//                     result.Operation == Operation.DocumentIndexEnd && result.EntityId == bookReply.Id))
//                 testOutputHelper.WriteLine("The indexing is complete.");
//         }
//
//         const string pattern = "Incremental Updates";
//         using var call = _client.TextSearch(new TextSearchRequest
//         {
//             Pattern = pattern
//         });
//         var searchResults = await call.ResponseStream.ReadAllAsync().ToListAsync();
//         Assert.NotEmpty(searchResults);
//     }
// }