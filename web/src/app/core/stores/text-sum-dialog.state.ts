import { Injectable } from '@angular/core';
import { BaseStateService } from '@core/types/base-state-service';

export interface TextSumDialogState {
  isLoading: boolean;
  summarizedText: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class TextSumDialogStateService extends BaseStateService<TextSumDialogState> {

  constructor() {
    super({
      isLoading: false,
      summarizedText: null,
    });
  }

}
