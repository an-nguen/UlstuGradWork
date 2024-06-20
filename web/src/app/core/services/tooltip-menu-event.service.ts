import { Injectable } from '@angular/core';
import { WordDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TooltipMenuEventService {

  public selectionEvent$: Observable<string | null>;
  public textCopyEvent$: Observable<string>;
  public translationEvent$: Observable<string>;
  public textSummarizationEvent$: Observable<string>;
  public defineEvent$: Observable<string>;
  public addDefinitionEvent$: Observable<WordDto>;
  public deleteDefinitionEvent$: Observable<WordDto>;

  private _selectionEvent = new Subject<string | null>();
  private _textCopyEvent = new Subject<string>();
  private _translationEvent = new Subject<string>();
  private _textSummarizationEvent = new Subject<string>();
  private _defineEvent = new Subject<string>();
  private _addDefinitionEvent = new Subject<WordDto>();
  private _deleteDefinitionEvent = new Subject<WordDto>();

  constructor() {
    this.selectionEvent$ = this._selectionEvent;
    this.textCopyEvent$ = this._textCopyEvent;
    this.translationEvent$ = this._translationEvent;
    this.textSummarizationEvent$ = this._textSummarizationEvent;
    this.defineEvent$ = this._defineEvent;
    this.addDefinitionEvent$ = this._addDefinitionEvent;
    this.deleteDefinitionEvent$ = this._deleteDefinitionEvent;
  }

  public emitSelectionEvent(value: string | null): void {
    this._selectionEvent.next(value);
  }

  public emitTextCopyEvent(value: string): void {
    this._textCopyEvent.next(value);
  }

  public emitTextSummarizationEvent(value: string): void {
    this._textSummarizationEvent.next(value);
  }

  public emitTranslationEvent(value: string): void {
    this._selectionEvent.next(value);
  }

  public emitDefineEvent(value: string): void {
    this._defineEvent.next(value);
  }

  public emitAddDefinitionEvent(wordDto: WordDto): void {
    this._addDefinitionEvent.next(wordDto);
  }

  public emitDeleteDefinitionEvent(wordDto: WordDto): void {
    this._deleteDefinitionEvent.next(wordDto);
  }

}
