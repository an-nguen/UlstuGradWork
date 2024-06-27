import { Injectable, Signal, signal } from "@angular/core";
import { CONSTANTS } from "@core/constants";
import { WordDto } from "@core/dtos/BookManager.Application.Common.DTOs";

@Injectable({
  providedIn: 'root'
})
export class TooltipMenuStateService {

  public isDefinitionLoadingSignal: Signal<boolean>;
  public isDefinitionPanelOpenSignal: Signal<boolean>;
  public savedWordsSignal: Signal<string[]>;
  public definitionEntriesSignal: Signal<WordDto[]>;
  public currentDefinitionProviderSignal: Signal<string | null>;
  public definitionProvidersSignal: Signal<string[]>;

  private _isDefinitionLoadingSignal = signal<boolean>(false);
  private _isDefinitionPanelOpenSignal = signal<boolean>(false);
  private _savedWordsSignal = signal<string[]>([]);
  private _definitionEntriesSignal = signal<WordDto[]>([]);
  private _currentDefinitionProviderSignal = signal<string | null>(CONSTANTS.DEFAULTS.DEFINITION_PROVIDER);
  private _definitionProvidersSignal = signal<string[]>([]);

  constructor() {
    this.isDefinitionLoadingSignal = this._isDefinitionLoadingSignal.asReadonly();
    this.isDefinitionPanelOpenSignal = this._isDefinitionPanelOpenSignal.asReadonly();
    this.savedWordsSignal = this._savedWordsSignal.asReadonly();
    this.definitionEntriesSignal = this._definitionEntriesSignal.asReadonly();
    this.currentDefinitionProviderSignal = this._currentDefinitionProviderSignal.asReadonly();
    this.definitionProvidersSignal = this._definitionProvidersSignal.asReadonly();
  }

  public set isDefinitionLoading(value: boolean) {
    this._isDefinitionLoadingSignal.set(value);
  }

  public set isDefinitionPanelOpen(value: boolean) {
    this._isDefinitionPanelOpenSignal.set(value);
  }

  public set savedWords(value: string[]) {
    this._savedWordsSignal.set(value);
  }

  public set definitionEntries(value: WordDto[]) {
    this._definitionEntriesSignal.set(value);
  }

  public set currentDefinitionProvider(value: string | null) {
    this._currentDefinitionProviderSignal.set(value);
  }

  public set definitionProviders(value: string[]) {
    this._definitionProvidersSignal.set(value);
  }

  public get isDefinitionLoading(): boolean {
    return this._isDefinitionLoadingSignal();
  }

  public get isDefinitionPanelOpen(): boolean {
    return this._isDefinitionPanelOpenSignal();
  }

  public get savedWords(): string[] {
    return this._savedWordsSignal();
  }

  public get definitionEntries(): WordDto[] {
    return this._definitionEntriesSignal();
  }

  public get currentDefinitionProvider(): string | null {
    return this._currentDefinitionProviderSignal();
  }

  public get definitionProviders(): string[] {
    return this._definitionProvidersSignal();
  }

}