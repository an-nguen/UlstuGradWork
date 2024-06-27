namespace BookManager.Tests;

public static class Constants
{
    public const string TestDbConnStr = "Host=localhost;Port=5432;Database=libmgr_test;Username=an";
    public const string TestFilepath = "../../../Assets/PDF32000_2008.pdf";
    public const string TestFileTitle = "PDF Specification";
    public const string AnotherTestFilepath = "../../../Assets/Free_Test_Data_10M.pdf";
    public const string SomeUserName = "SomeUser";
    public const string SomeUserPinCode = "1234";
    public const string AnotherUserName = "AnotherUser";
    public const string AnotherUserPinCode = "4321";
    public const long BufferSize = 1048576; // 1 MiB
}