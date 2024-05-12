import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BookDetailsUpdateDto, BookDto, BookMetadataDto, LastViewedPageUpdateRequest, PageDto, SortOrder } from '@core/dtos/BookManager.Application.Common.DTOs';
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

  public getPage(
    pageNumber: number,
    pageSize: number,
    sortBy?: string,
    sortOrder?: SortOrder)
    : Observable<PageDto<BookDto>> {
    let queryParams = new HttpParams({ fromObject: { pageNumber, pageSize } });
    if (sortBy) queryParams = queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams = queryParams.append('sortOrder', sortOrder);
    return this._httpClient.get<PageDto<BookDto>>(this._url, { params: queryParams });
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
    details: BookDetailsUpdateDto
  ): Observable<BookDto> {
    return this._httpClient.put<BookDto>(`${this._url}/${id}`, details);
  }

  public deleteBook(id: string): Observable<void> {
    return this._httpClient.delete<void>(`${this._url}/${id}`);
  }

  public updateLastViewedPage(id: string, pageNumber: number): Observable<void> {
    return this._httpClient.post<void>(`${this._url}/${id}/last-viewed-page`, { pageNumber } as LastViewedPageUpdateRequest);
  }

  public getBookDownloadUrl(id: string): URL {
    return new URL(`${this._url}/download/${id}`);
  }

}
