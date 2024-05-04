import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BookDto, BookMetadataDto, Details } from '@core/dtos/BookManager.Application.Common.DTOs';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class BookService {

  private readonly _url: string = `${environment.BASE_URL}/books`;

  constructor(
    private readonly _httpClient: HttpClient
  ) { }

  public getBooks(pageNumber: number, pageSize: number): Observable<BookDto[]> {
    return this._httpClient.get<BookDto[]>(this._url, { params: { pageNumber, pageSize } });
  }

  public getBookById(id: string): Observable<BookDto> {
    return this._httpClient.get<BookDto>(`${this._url}/${id}`);
  }

  public addBook(
    bookMetadata: BookMetadataDto,
    file: File
  ): Observable<BookDto> {
    const formData = new FormData();
    formData.append('bookMetadata', JSON.stringify(bookMetadata));
    formData.append('file', file);
    return this._httpClient.post<BookDto>(`${this._url}`, formData);
  }

  public updateBookDetails(
    id: string,
    details: Details
  ): Observable<BookDto> {
    return this._httpClient.put<BookDto>(`${this._url}/${id}`, details);
  }

  public deleteBook(id: string): Observable<void> {
    return this._httpClient.delete<void>(`${this._url}/${id}`);
  }

  public getBookDownloadUrl(id: string): URL {
    return new URL(`${this._url}/download/${id}`);
  }
}
