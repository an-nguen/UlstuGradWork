import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { DetectLanguageRequestDto, DetectLanguageResponseDto, LanguageDto, TranslationRequestDto, TranslationResponseDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TextProcessingService {

  private readonly _url: string = `${environment.BASE_URL}/text-processing`;

  public availableLanguages = signal<LanguageDto[]>([]);

  constructor(private readonly _client: HttpClient) {
    this._loadLanguages();
  }

  public listLanguages(): Observable<LanguageDto[]> {
    return this._client.get<LanguageDto[]>(`${this._url}/list-languages`);
  }

  public translate(request: TranslationRequestDto): Observable<TranslationResponseDto> {
    return this._client.post<TranslationResponseDto>(`${this._url}/translate`, request);
  }

  public detectLanguage(request: DetectLanguageRequestDto): Observable<DetectLanguageResponseDto> {
    return this._client.post<DetectLanguageResponseDto>(`${this._url}/detect-language`, request);
  }

  private _loadLanguages(): void {
    this.listLanguages().subscribe((languages) => {
      this.availableLanguages.set(languages);
    });
  }
}
