import { ChangeDetectionStrategy, Component, computed, DestroyRef, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { WordDefinitionDto, WordDto } from '@core/dtos/BookManager.Application.Common.DTOs';

interface WordDefinitionRow extends WordDefinitionDto {
  isEditMode: boolean;
  initialState?: WordDefinitionDto;
}

interface TableColumn<T> {
  columnDef: keyof T;
  name: string;
  width?: string;
}

@Component({
  selector: 'app-dictionary-word-edit-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatListModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './dictionary-word-edit-form.component.html',
  styleUrl: './dictionary-word-edit-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DictionaryWordEditFormComponent implements OnInit {

  public readonly definitionTableColumns: TableColumn<WordDefinitionDto>[] = [
    {
      columnDef: 'partOfSpeech',
      name: 'Часть речи',
      width: '15%',
    },
    {
      columnDef: 'subjectName',
      name: 'Предметная область',
      width: '15%',
    },
    {
      columnDef: 'definition',
      name: 'Определение',
      width: '70%'
    }
  ];
  public readonly displayedDefinitionTableColumns: string[] = [
    ...this.definitionTableColumns.map(c => c.columnDef),
    'actions'
  ];

  public readonly word = input<WordDto | null>(null);
  public readonly word$ = toObservable(this.word);

  public readonly saveEvent = output<WordDto | null>();
  public readonly closeEvent = output<void>();

  public readonly title = computed(() => {
    const isWordSelected = !!this.word();
    return !isWordSelected ? 'Добавление словарного слова' : 'Изменение словарного слова';
  });
  public readonly dictionaryWordFormGroup = this._fb.group({
    word: this._fb.control<string>('', [Validators.required]),
    transcription: this._fb.control<string | null>(null),
    languageCode: this._fb.control<string | null>(null),
    stem: this._fb.control<string | null>(null),
  });

  public wordId: string | null = null;
  public stems: string[] = [];
  public definitions: WordDefinitionRow[] = [];

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _destroyRef: DestroyRef,
  ) { }

  public ngOnInit(): void {
    this.word$.pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe((value) => {
      this._updateFormGroup(value);
    });
  }

  public saveDictionaryWord(): void {
    if (this.dictionaryWordFormGroup.invalid) return;
    const formValues = this.dictionaryWordFormGroup.value;
    this.saveEvent.emit({
      id: this.wordId ?? undefined,
      word: formValues.word!,
      transcription: formValues.transcription ?? undefined,
      languageCode: formValues.languageCode ?? undefined,
      stems: this.stems,
      definitions: this.definitions,
    });
  }

  public emitCloseEvent(): void {
    this.closeEvent.emit();
  }

  public addWordStem(): void {
    const stemValue = this.dictionaryWordFormGroup.value.stem;
    if (!stemValue) return;
    this.stems = [...this.stems, stemValue];
  }

  public addWordDefinition(): void {
    this.definitions = [...this.definitions, {
      isEditMode: true,
      subjectName: '',
      definition: '',
      partOfSpeech: '',
    }];
  }

  public editWordDefinitionRow(row: WordDefinitionRow): void {
    row.isEditMode = true;
    row.initialState = { ...row };
  }

  public applyWordDefinitionRowChanges(row: WordDefinitionRow): void {
    row.isEditMode = false;
  }

  public cancelWordDefinitionRowEdit(row: WordDefinitionRow, index: number): void {
    if (!row.initialState) {
      this.definitions = this.definitions.filter((_, i) => i !== index);
    } else {
      this.definitions[index] = { ...row.initialState, isEditMode: false };
    }
  }

  private _updateFormGroup(word: WordDto | null): void {
    this.dictionaryWordFormGroup.setValue({
      word: word?.word ?? null,
      transcription: word?.transcription ?? null,
      languageCode: word?.languageCode ?? null,
      stem: null
    });
    this.wordId = word?.id ?? null;
    this.definitions = word?.definitions.map(definition => ({ ...definition, isEditMode: false })) ?? [];
    this.stems = word?.stems ?? [];
  }

}
