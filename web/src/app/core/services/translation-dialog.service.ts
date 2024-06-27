import { Injectable } from '@angular/core';
import { LanguageDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { BaseStateService } from '@core/types/base-state-service';
import { Observable, Subject } from 'rxjs';

export interface TranslationFormChangeEvent {
  sourceLanguage: string | null;
  targetLanguage: string | null;
  sourceText: string | null;
}

export interface TranslationDialogComponentData {
  availableLanguages: LanguageDto[];
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationDialogState {
  translatedText: string | null;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationDialogService extends BaseStateService<TranslationDialogState> {

  public translationFormChangeEvent: Observable<TranslationFormChangeEvent>;
  private _translationFormChangeEvent = new Subject<TranslationFormChangeEvent>();

  constructor() {
    super({
      translatedText: null,
      isLoading: false,
    });
    this.translationFormChangeEvent = this._translationFormChangeEvent.asObservable();
  }

  public emitTranslationFormChangeEvent(event: TranslationFormChangeEvent): void {
    this._translationFormChangeEvent.next(event);
  }

}
