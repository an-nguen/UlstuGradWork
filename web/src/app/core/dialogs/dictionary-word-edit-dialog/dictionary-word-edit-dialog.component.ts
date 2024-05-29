import { ChangeDetectionStrategy, Component, computed, Inject, OnInit, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { DigitOnlyModule } from '@uiowa/digit-only';
import { WordDefinitionDto, WordDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { MatListModule } from '@angular/material/list';
import { MatColumnDef, MatTable, MatTableModule } from '@angular/material/table';

interface DialogData {
  wordEntry: WordDto;
  mode?: 'create' | 'update';
}

@Component({
  selector: 'app-dictionary-word-edit-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatInputModule,
    MatLabel,
    ReactiveFormsModule,
    MatButton,
    MatListModule,
    MatDialogActions,
    MatTableModule,
  ],
  templateUrl: './dictionary-word-edit-dialog.component.html',
  styleUrl: './dictionary-word-edit-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DictionaryWordEditDialogComponent implements OnInit {

  protected readonly CREATION_DIALOG_TITLE = 'Добавление слова';
  protected readonly EDIT_DIALOG_TITLE = 'Обновление определения слова';

  public displayedColumns = ['partOfSpeech', 'subjectName', 'definition'];
  public isEditMode = signal<boolean>(false);
  public dialogTitle = computed(() => {
    return this.isEditMode() ? this.EDIT_DIALOG_TITLE : this.CREATION_DIALOG_TITLE;
  });

  public dictionaryWordEditFormGroup = this._fb.group({
    transcription: this._fb.control<string | null>(null),
    languageCode: this._fb.control<string | null>(null),
    definitions: this._fb.nonNullable.control<WordDefinitionDto[]>([]),
  });

  public definitionFormGroup = this._fb.group({
    partOfSpeech: this._fb.control<string | null>(null, [Validators.required]),
    subjectName: this._fb.control<string | null>(null),
    definition: this._fb.control<string | null>(null, [Validators.required]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly _dialogData: DialogData,
    private readonly _dialogRef: MatDialogRef<DictionaryWordEditDialogComponent>,
    private readonly _fb: FormBuilder,
  ) {
    this.initForm();
  }

  public ngOnInit(): void {
    this.isEditMode.set(this._dialogData?.mode === 'update');
  }

  public initForm(): void {
    const wordEntry = this._dialogData.wordEntry;
    this.dictionaryWordEditFormGroup.patchValue({
      transcription: wordEntry.transcription,
      languageCode: wordEntry.languageCode,
      definitions: wordEntry.definitions,
    });
  }

  public save(): void {
    this._dialogRef.close();
  }

  public close(): void {
    this._dialogRef.close();
  }

}
