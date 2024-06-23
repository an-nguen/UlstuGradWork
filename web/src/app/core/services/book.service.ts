import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BookDetailsUpdateDto,
  BookDto,
  BookMetadataDto,
  LastViewedPageUpdateRequest,
  PageDto,
  SearchRequestDto,
  SortOrder,
  TicketDto,
  TotalTimeUpdateRequestDto,
} from '@core/dtos/BookManager.Application.Common.DTOs';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CONSTANTS } from '@core/constants';

@Injectable({
  providedIn: 'root',
})
export class BookService {

  private readonly _url: string = `${environment.BASE_URL}/books`;
  private _ticketIdSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private readonly _httpClient: HttpClient
  ) {
    this._loadTicket();
  }

  public getPage(
    pageNumber: number,
    pageSize: number,
    sortBy?: string,
    sortOrder?: SortOrder,
  ): Observable<PageDto<BookDto>> {
    let queryParams = new HttpParams({ fromObject: { pageNumber, pageSize } });
    if (sortBy) queryParams = queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams = queryParams.append('sortOrder', sortOrder);
    return this._httpClient.get<PageDto<BookDto>>(this._url, {
      params: queryParams,
    });
  }

  public getBookById(id: string): Observable<BookDto> {
    return this._httpClient.get<BookDto>(`${this._url}/${id}`);
  }

  public addBook(
    bookMetadata: BookMetadataDto,
    file: File,
  ): Observable<BookDto> {
    const formData = new FormData();
    formData.append('bookMetadata', JSON.stringify(bookMetadata));
    formData.append('file', file);
    return this._httpClient.post<BookDto>(`${this._url}`, formData);
  }

  public updateBookDetails(
    id: string,
    details: BookDetailsUpdateDto,
  ): Observable<BookDto> {
    return this._httpClient.put<BookDto>(`${this._url}/${id}`, details);
  }

  public updateTotalTime(
    bookId: string,
    timeInSeconds: number
  ): Observable<void> {
    return this._httpClient.post<void>(
      `${this._url}/${bookId}/update-total-time`,
      {
        seconds: timeInSeconds,
        ticketId: this._ticketIdSubject.getValue()
      } as TotalTimeUpdateRequestDto
    );
  }

  public deleteBook(id: string): Observable<void> {
    return this._httpClient.delete<void>(`${this._url}/${id}`);
  }

  public updateLastViewedPage(
    id: string,
    pageNumber: number,
  ): Observable<void> {
    return this._httpClient.post<void>(`${this._url}/${id}/last-viewed-page`, {
      pageNumber,
    } as LastViewedPageUpdateRequest);
  }

  public getBookDownloadUrl(id: string): URL {
    return new URL(`${this._url}/download/${id}`);
  }

  public searchByBookDetails(request: SearchRequestDto): Observable<PageDto<BookDto>> {
    return this._httpClient.post<PageDto<BookDto>>(`${this._url}/search`, request);
  }

  public createTicket(): Observable<TicketDto> {
    return this._httpClient.post<TicketDto>(`${this._url}/tickets`, null);
  }

  private _loadTicket(): void {
    const ticketId = localStorage.getItem(CONSTANTS.DEFAULTS.TICKET_ID_LOCAL_STORAGE_KEY);
    if (!ticketId) {
      this.createTicket()
        .subscribe((ticket) => {
          this._ticketIdSubject.next(ticket.id);
          localStorage.setItem(CONSTANTS.DEFAULTS.TICKET_ID_LOCAL_STORAGE_KEY, ticket.id);
        });
    } else {
      this._ticketIdSubject.next(ticketId);
    }
  }

}
