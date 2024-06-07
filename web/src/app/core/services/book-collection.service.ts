import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { BookCollectionDto, BookCollectionModRequest } from '@core/dtos/BookManager.Application.Common.DTOs';

@Injectable({
  providedIn: 'root',
})
export class BookCollectionService {

  private readonly _url: string = `${environment.BASE_URL}/book-collections`;

  constructor(
    private readonly _httpClient: HttpClient,
  ) {
  }

  public getAll(): Observable<BookCollectionDto[]> {
    return this._httpClient.get<BookCollectionDto[]>(this._url);
  }

  public create(request: BookCollectionModRequest): Observable<BookCollectionDto> {
    return this._httpClient.post<BookCollectionDto>(this._url, request);
  }

  public update(id: string, request: BookCollectionModRequest): Observable<BookCollectionDto> {
    return this._httpClient.put<BookCollectionDto>(`${this._url}/${id}`, request);
  }

  public delete(id: string): Observable<void> {
    return this._httpClient.delete<void>(`${this._url}/${id}`);
  }

}
