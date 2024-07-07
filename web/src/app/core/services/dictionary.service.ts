import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageDto, PageRequestDto, WordDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DictionaryService {

  private readonly _url = `${environment.BASE_URL}/word-dictionary`;

  constructor(
    private readonly _httpClient: HttpClient,
  ) {
  }

  public getPage(pageRequest: PageRequestDto): Observable<PageDto<WordDto>> {
    const params = new HttpParams()
      .set('pageNumber', pageRequest.pageNumber)
      .set('pageSize', pageRequest.pageSize)
      .set('sortBy', pageRequest.sortBy ?? '')
      .set('sortOrder', pageRequest.sortOrder);
    return this._httpClient.get<PageDto<WordDto>>(`${this._url}`, { params });
  }

  public listThirdPartyProviders(): Observable<string[]> {
    return this._httpClient.get<string[]>(`${this._url}/list-third-party-providers`);
  }

  public find(word: string): Observable<WordDto[]> {
    const url = `${this._url}/${word}`;
    return this._httpClient.get<WordDto[]>(url);
  }

  public findInExtDict(word: string, providerName: string): Observable<WordDto[]> {
    const url = `${this._url}/third-party-dictionary/${word}`;
    const params = new HttpParams().set('providerName', providerName);
    return this._httpClient.get<WordDto[]>(url, { params });
  }

  public addWord(word: WordDto): Observable<WordDto> {
    return this._httpClient.post<WordDto>(this._url, word);
  }

  public updateWord(id: string, updateRequest: WordDto): Observable<WordDto> {
    return this._httpClient.put<WordDto>(`${this._url}/${id}`, updateRequest);
  }

  public deleteWord(id: string): Observable<void> {
    return this._httpClient.delete<void>(`${this._url}/${id}`);
  }

}
