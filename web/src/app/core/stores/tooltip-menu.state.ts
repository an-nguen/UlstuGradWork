import { Injectable } from "@angular/core";
import { DEFAULT_DEFINITION_PROVIDER } from "@core/constants/defaults.constant";
import { WordDto } from "@core/dtos/BookManager.Application.Common.DTOs";
import { BaseStateService } from "@core/services/base-state-service";

export interface DefinitionMenuState {
  isLoading: boolean;
  isOpen: boolean;
  savedWords: string[];
  entries: WordDto[];
  currentProvider: string | null;
  providers: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TooltipMenuStateService extends BaseStateService<DefinitionMenuState> {

  constructor() {
    super({
      isLoading: false,
      isOpen: false,
      savedWords: [],
      entries: [],
      currentProvider: DEFAULT_DEFINITION_PROVIDER,
      providers: [],
    });
  }

}