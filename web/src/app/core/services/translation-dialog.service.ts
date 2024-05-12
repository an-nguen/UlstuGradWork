import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslationDialogComponent, TranslationDialogComponentData } from '@core/components/translation-dialog/translation-dialog.component';
import { TranslationRequestDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationDialogService {

  protected readonly WIDTH = '70vw';
  protected readonly HEIGHT = '60vh';

  public loading$ = new BehaviorSubject<boolean>(false);
  public sourceLanguageCode$ = new Subject<string>();
  public targetText$ = new Subject<string>();
  public valueChanges$ = new Subject<TranslationRequestDto>();

  constructor(
    private readonly _dialog: MatDialog
  ) { }

  public open(data: TranslationDialogComponentData): MatDialogRef<TranslationDialogComponent> {
    const dialogRef = this._dialog.open(TranslationDialogComponent, {
      width: this.WIDTH,
      height: this.HEIGHT,
      data
    });
    return dialogRef;
  }

}
