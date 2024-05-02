namespace BookManager.Tests;

public static class Utils
{
    public static string GetProjectDirectory()
    {
        var workingDirectory = Environment.CurrentDirectory;
        return Directory.GetParent(workingDirectory)!.Parent!.Parent!.FullName;
    }
}