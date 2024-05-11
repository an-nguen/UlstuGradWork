import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslationRequestDto, TranslationResponseDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TextProcessingService {

  private readonly _url: string = `${environment.BASE_URL}/text-processing`;

  constructor(private readonly _client: HttpClient) { }

  public translate(request: TranslationRequestDto): Observable<TranslationResponseDto> {
    return this._client.post<TranslationResponseDto>(`${this._url}/translate`, request);
  }
}
