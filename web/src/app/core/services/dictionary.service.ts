import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WordDto } from '@core/dtos/BookManager.Application.Common.DTOs';
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

  public updateWord(word: string, updateRequest: WordDto): Observable<WordDto> {
    return this._httpClient.put<WordDto>(`${this._url}/${word}`, updateRequest);
  }

  public deleteWord(word: string): Observable<void> {
    return this._httpClient.delete<void>(`${this._url}/${word}`);
  }

}
