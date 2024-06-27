import { Injectable } from "@angular/core";
import { CONSTANTS } from "@core/constants";
import { WordDto } from "@core/dtos/BookManager.Application.Common.DTOs";
import { BaseStateService } from "@core/types/base-state-service";

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
      currentProvider: CONSTANTS.DEFAULTS.DEFINITION_PROVIDER,
      providers: [],
    });
  }

}