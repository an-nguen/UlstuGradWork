﻿namespace BookManager.Application.Common.Config;

public class YandexCloudOptions
{
    public const string YandexCloud = "YandexCloud";

    public string KeyId { get; init; } = string.Empty;
    public string ServiceAccountId { get; init; } = string.Empty;
    public string PrivateKeyFilePath { get; init; } = string.Empty;
}