import { ChangeDetectionStrategy, Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from "@angular/material/input";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DictionaryWordEditFormComponent } from '@core/components/dictionary-word-edit-form/dictionary-word-edit-form.component';
import { DictionaryWordListComponent } from "@core/components/dictionary-word-list/dictionary-word-list.component";
import { DeleteConfirmationDialogComponent } from '@shared/dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { PageRequestDto, SortOrder, WordDto } from "@core/dtos/BookManager.Application.Common.DTOs";
import { DictionaryService } from "@core/services/api/dictionary.service";
import { finalize, NEVER, switchMap } from 'rxjs';

@Component({
  selector: 'app-dictionary-explorer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    DictionaryWordListComponent,
    DictionaryWordEditFormComponent,
  ],
  templateUrl: './dictionary-explorer.component.html',
  styleUrl: './dictionary-explorer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DictionaryExplorerComponent {

  public readonly WORD_ADD_TOOLTIP_MESSAGE = 'Добавить словарное слово';
  public readonly WORD_SAVE_SUCCESSFUL_MESSAGE = 'Словарное слово сохранено.'
  public readonly WORD_DELETE_SUCCESSFUL_MESSAGE = 'Словарное слово успешно удалено.'
  public readonly WORD_NOT_SELECTED_MESSAGE = 'Словарное слово не выбрано.'
  public readonly WORD_DELETION_CONFIRMATION_DIALOG_MESSAGE = 'Вы уверены, что хотите удалить данное словарное слово?';

  public wordList = signal<WordDto[]>([]);
  public searchFormCtrl = new FormControl<string | null>(null, [Validators.minLength(3)]);
  public selectedWord = signal<WordDto | null>(null);
  public isCreateFormOpened = signal<boolean>(false);

  private _pageNumber: number = 0;
  private _totalItemCount: number = 0;
  private _pageSize = 10;

  constructor(
    private readonly _service: DictionaryService,
    private readonly _snackBar: MatSnackBar,
    private readonly _dialog: MatDialog,
    private readonly _destroyRef: DestroyRef,
  ) { }

  public updatePageSize(pageSize: number): void {
    this._pageSize = pageSize;
    this._loadDictionaryWords();
  }

  public showWordDefinition(word: WordDto): void {
    this.setDictWordEditFormVisibility(false);
    this.selectedWord.set(word);
  }

  public setDictWordEditFormVisibility(visibility: boolean, word: WordDto | null = null): void {
    this.selectedWord.set(word);
    this.isCreateFormOpened.set(visibility);
  }

  public saveWord(word: WordDto | null): void {
    if (!word) return;
    const selectedWord = this.selectedWord();
    const word$ = (!selectedWord)
      ? this._service.addWord(word)
      : this._service.updateWord(selectedWord.id!, word);
    word$.subscribe(() => {
      this.setDictWordEditFormVisibility(false);
      this._showWordSaveSuccessMessage();
      this._loadDictionaryWords();
    });
  }

  public deleteDictionaryWord(word: WordDto): void {
    this._dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        message: this.WORD_DELETION_CONFIRMATION_DIALOG_MESSAGE,
      }
    })
      .afterClosed()
      .pipe(
        switchMap((isConfirmed) => {
          if (!isConfirmed) return NEVER;
          return this._service.deleteWord(word.id!)
            .pipe(finalize(() => {

              this.setDictWordEditFormVisibility(false);
              this._snackBar.open(this.WORD_DELETE_SUCCESSFUL_MESSAGE, 'OK');
              this._loadDictionaryWords();
            }))

        }),
        takeUntilDestroyed(this._destroyRef))
      .subscribe();
  }

  private _getPageRequest(): PageRequestDto {
    return {
      pageNumber: this._pageNumber,
      pageSize: this._pageSize,
      sortOrder: SortOrder.Asc
    };
  }

  private _loadDictionaryWords(): void {
    this._service.getPage(this._getPageRequest())
      .subscribe((page) => {
        this.wordList.set(page.items);
        this._totalItemCount = page.totalItemCount;
      });
  }

  private _showWordSaveSuccessMessage(): void {
    this._snackBar.open(this.WORD_SAVE_SUCCESSFUL_MESSAGE, 'OK');
  }

}
