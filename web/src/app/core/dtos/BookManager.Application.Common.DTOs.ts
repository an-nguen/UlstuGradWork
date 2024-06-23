/* THIS (.ts) FILE IS GENERATED BY Tapper */
/* eslint-disable */
/* tslint:disable */
import type { BookFileType } from './BookManager.Domain.Enums';

/** Transpiled from BookManager.Application.Common.DTOs.AuthenticationRequestDto */
export type AuthenticationRequestDto = {
    /** Transpiled from string */
    name: string;
    /** Transpiled from string */
    pinCode: string;
}

/** Transpiled from BookManager.Application.Common.DTOs.AuthenticationResponseDto */
export type AuthenticationResponseDto = {
    /** Transpiled from BookManager.Application.Common.DTOs.AuthenticationStatus */
    status: AuthenticationStatus;
    /** Transpiled from string? */
    accessToken?: string;
}

/** Transpiled from BookManager.Application.Common.DTOs.AuthenticationStatus */
export enum AuthenticationStatus {
    Failed = 0,
    Success = 1,
}

/** Transpiled from BookManager.Application.Common.DTOs.BookCollectionDto */
export type BookCollectionDto = {
    /** Transpiled from System.Guid */
    id: string;
    /** Transpiled from string */
    name: string;
    /** Transpiled from System.Collections.Generic.ICollection<BookManager.Application.Common.DTOs.BookDto>? */
    books?: BookDto[];
}

/** Transpiled from BookManager.Application.Common.DTOs.BookCollectionModRequest */
export type BookCollectionModRequest = {
    /** Transpiled from string */
    name: string;
    /** Transpiled from System.Collections.Generic.ICollection<BookManager.Application.Common.DTOs.BookDto>? */
    books?: BookDto[];
}

/** Transpiled from BookManager.Application.Common.DTOs.BookDetailsUpdateDto */
export type BookDetailsUpdateDto = {
    /** Transpiled from string? */
    title?: string;
    /** Transpiled from string? */
    description?: string;
    /** Transpiled from string? */
    isbn?: string;
    /** Transpiled from string? */
    publisherName?: string;
    /** Transpiled from System.Collections.Generic.IEnumerable<string>? */
    authors?: string[];
    /** Transpiled from System.Collections.Generic.IEnumerable<string>? */
    tags?: string[];
}

/** Transpiled from BookManager.Application.Common.DTOs.BookDto */
export type BookDto = {
    /** Transpiled from BookManager.Application.Common.DTOs.BookDto.Details */
    documentDetails: Details;
    /** Transpiled from BookManager.Application.Common.DTOs.BookDto.BookFileMetadata */
    fileMetadata: BookFileMetadata;
    /** Transpiled from BookManager.Application.Common.DTOs.BookDto.UserStats? */
    stats?: UserStats;
}

/** Transpiled from BookManager.Application.Common.DTOs.BookDto.Details */
export type Details = {
    /** Transpiled from System.Guid */
    id: string;
    /** Transpiled from string? */
    title?: string;
    /** Transpiled from string? */
    isbn?: string;
    /** Transpiled from string? */
    description?: string;
    /** Transpiled from string? */
    publisherName?: string;
    /** Transpiled from string? */
    thumbnailUrl?: string;
    /** Transpiled from int */
    pageCount?: number;
    /** Transpiled from string[]? */
    authors?: string[];
    /** Transpiled from string[]? */
    tags?: string[];
}

/** Transpiled from BookManager.Application.Common.DTOs.BookDto.UserStats */
export type UserStats = {
    /** Transpiled from long */
    totalReadingTime?: number;
    /** Transpiled from System.DateTimeOffset */
    recentAccessTime?: (Date | string);
    /** Transpiled from int */
    lastViewedPage?: number;
    /** Transpiled from System.Collections.Generic.IEnumerable<BookManager.Application.Common.DTOs.TotalReadingTimeDto>? */
    totalReadingTimes?: TotalReadingTimeDto[];
}

/** Transpiled from BookManager.Application.Common.DTOs.BookDto.BookFileMetadata */
export type BookFileMetadata = {
    /** Transpiled from BookManager.Domain.Enums.BookFileType */
    type: BookFileType;
    /** Transpiled from long */
    size: number;
}

/** Transpiled from BookManager.Application.Common.DTOs.BookMetadataDto */
export type BookMetadataDto = {
    /** Transpiled from string */
    filename: string;
    /** Transpiled from long */
    fileSizeInBytes: number;
    /** Transpiled from BookManager.Domain.Enums.BookFileType */
    fileType: BookFileType;
    /** Transpiled from string? */
    title?: string;
    /** Transpiled from string? */
    isbn?: string;
    /** Transpiled from string? */
    description?: string;
    /** Transpiled from string? */
    publisherName?: string;
    /** Transpiled from System.Collections.Generic.IEnumerable<string>? */
    authors?: string[];
    /** Transpiled from System.Collections.Generic.IEnumerable<string>? */
    tags?: string[];
}

/** Transpiled from BookManager.Application.Common.DTOs.BookTextDto */
export type BookTextDto = {
    /** Transpiled from System.Guid */
    bookDocumentId: string;
    /** Transpiled from string */
    text: string;
    /** Transpiled from int */
    pageNumber?: number;
}

/** Transpiled from BookManager.Application.Common.DTOs.DetectLanguageRequestDto */
export type DetectLanguageRequestDto = {
    /** Transpiled from string */
    text: string;
}

/** Transpiled from BookManager.Application.Common.DTOs.DetectLanguageResponseDto */
export type DetectLanguageResponseDto = {
    /** Transpiled from string */
    detectedLanguageCode: string;
}

/** Transpiled from BookManager.Application.Common.DTOs.FullTextSearchTreeEntryDto */
export type FullTextSearchTreeEntryDto = {
    /** Transpiled from System.Guid */
    bookId: string;
    /** Transpiled from BookManager.Application.Common.DTOs.BookDto.Details? */
    bookDetails?: Details;
    /** Transpiled from System.Collections.Generic.IEnumerable<BookManager.Application.Common.DTOs.BookTextDto> */
    texts: BookTextDto[];
}

/** Transpiled from BookManager.Application.Common.DTOs.LanguageDto */
export type LanguageDto = {
    /** Transpiled from string */
    code: string;
    /** Transpiled from string */
    name: string;
}

/** Transpiled from BookManager.Application.Common.DTOs.LastViewedPageUpdateRequest */
export type LastViewedPageUpdateRequest = {
    /** Transpiled from int */
    pageNumber: number;
}

/** Transpiled from BookManager.Application.Common.DTOs.PageDto<T> */
export type PageDto<T> = {
    /** Transpiled from System.Collections.Generic.IEnumerable<T> */
    items: T[];
    /** Transpiled from int */
    pageSize: number;
    /** Transpiled from int */
    pageNumber: number;
    /** Transpiled from int */
    pageCount: number;
    /** Transpiled from int */
    totalItemCount: number;
}

/** Transpiled from BookManager.Application.Common.DTOs.PageRequestDto */
export type PageRequestDto = {
    /** Transpiled from int */
    pageNumber: number;
    /** Transpiled from int */
    pageSize: number;
    /** Transpiled from string? */
    sortBy?: string;
    /** Transpiled from BookManager.Application.Common.DTOs.SortOrder */
    sortOrder: SortOrder;
}

/** Transpiled from BookManager.Application.Common.DTOs.SortOrder */
export enum SortOrder {
    Asc = 0,
    Desc = 1,
}

/** Transpiled from BookManager.Application.Common.DTOs.SearchRequestDto */
export type SearchRequestDto = {
    /** Transpiled from int */
    pageSize: number;
    /** Transpiled from int */
    pageNumber: number;
    /** Transpiled from string? */
    sortProperty?: string;
    /** Transpiled from BookManager.Application.Common.DTOs.SortOrder */
    sortOrder?: SortOrder;
    /** Transpiled from string? */
    title?: string;
    /** Transpiled from string? */
    description?: string;
    /** Transpiled from string? */
    isbn?: string;
    /** Transpiled from string? */
    publisherName?: string;
    /** Transpiled from string[]? */
    authors?: string[];
}

/** Transpiled from BookManager.Application.Common.DTOs.TextSummarizationRequestDto */
export type TextSummarizationRequestDto = {
    /** Transpiled from string */
    text: string;
}

/** Transpiled from BookManager.Application.Common.DTOs.TextSummarizationResponseDto */
export type TextSummarizationResponseDto = {
    /** Transpiled from string */
    summarizedText: string;
}

/** Transpiled from BookManager.Application.Common.DTOs.TicketDto */
export type TicketDto = {
    /** Transpiled from System.Guid */
    id: string;
    /** Transpiled from System.Guid */
    userId: string;
    /** Transpiled from System.DateTimeOffset */
    issuedAt: (Date | string);
}

/** Transpiled from BookManager.Application.Common.DTOs.TotalReadingTimeDto */
export type TotalReadingTimeDto = {
    /** Transpiled from System.Guid */
    ticketId: string;
    /** Transpiled from long */
    timeInSeconds: number;
}

/** Transpiled from BookManager.Application.Common.DTOs.TotalTimeUpdateRequestDto */
export type TotalTimeUpdateRequestDto = {
    /** Transpiled from System.Guid */
    ticketId: string;
    /** Transpiled from long */
    seconds: number;
}

/** Transpiled from BookManager.Application.Common.DTOs.TranslationRequestDto */
export type TranslationRequestDto = {
    /** Transpiled from string? */
    sourceLanguage?: string;
    /** Transpiled from string */
    targetLanguage: string;
    /** Transpiled from string */
    sourceText: string;
}

/** Transpiled from BookManager.Application.Common.DTOs.TranslationResponseDto */
export type TranslationResponseDto = {
    /** Transpiled from string? */
    detectedSourceLanguage?: string;
    /** Transpiled from string */
    targetLanguage: string;
    /** Transpiled from string */
    translatedText: string;
}

/** Transpiled from BookManager.Application.Common.DTOs.UserAddRequest */
export type UserAddRequest = {
    /** Transpiled from string */
    name: string;
    /** Transpiled from string */
    pinCode: string;
}

/** Transpiled from BookManager.Application.Common.DTOs.UserUpdateRequest */
export type UserUpdateRequest = {
    /** Transpiled from string */
    currentPINCode: string;
    /** Transpiled from string */
    newPINCode: string;
}

/** Transpiled from BookManager.Application.Common.DTOs.UserDeleteRequest */
export type UserDeleteRequest = {
    /** Transpiled from string */
    currentPINCode: string;
}

/** Transpiled from BookManager.Application.Common.DTOs.UserDto */
export type UserDto = {
    /** Transpiled from System.Guid */
    id: string;
    /** Transpiled from string */
    name: string;
}

/** Transpiled from BookManager.Application.Common.DTOs.WordDefinitionDto */
export type WordDefinitionDto = {
    /** Transpiled from string */
    partOfSpeech: string;
    /** Transpiled from string */
    subjectName: string;
    /** Transpiled from string */
    definition: string;
}

/** Transpiled from BookManager.Application.Common.DTOs.WordDto */
export type WordDto = {
    /** Transpiled from string */
    word: string;
    /** Transpiled from string? */
    transcription?: string;
    /** Transpiled from string? */
    languageCode?: string;
    /** Transpiled from string[]? */
    stems?: string[];
    /** Transpiled from System.Collections.Generic.ICollection<BookManager.Application.Common.DTOs.WordDefinitionDto> */
    definitions: WordDefinitionDto[];
}

