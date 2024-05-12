import { ChangeDetectionStrategy, Component, DestroyRef, Inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LanguageDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { TranslationDialogService } from '@core/services/translation-dialog.service';

export interface TranslationDialogComponentData {
  languages: LanguageDto[];
  sourceText: string;
  targetLanguageCode: string;
}

@Component({
  selector: 'app-translation-dialog',
  templateUrl: './translation-dialog.component.html',
  styleUrl: './translation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslationDialogComponent implements OnInit {

  public loading = this._translationDialogService.loading$.asObservable();
  public targetText = this._translationDialogService.targetText$.asObservable();

  public languages = signal<LanguageDto[]>([]);

  public languageFormGroup = this._fb.group({
    sourceLanguage: this._fb.control<string | null>(null, [Validators.required]),
    sourceText: this._fb.control<string | null>(null, { updateOn: 'blur', validators: [Validators.required] },),
    targetLanguage: this._fb.control<string | null>(null, [Validators.required]),
  });


  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: TranslationDialogComponentData,
    private readonly _translationDialogService: TranslationDialogService,
    private readonly _fb: FormBuilder,
    private readonly _destroyRef: DestroyRef,
  ) { }

  public ngOnInit(): void {
    this.languageFormGroup.valueChanges.pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(() => {
      this.emitValueChanges();
    });
    this._translationDialogService.sourceLanguageCode$.subscribe((languageCode) => {
      this.languageFormGroup.patchValue({ sourceLanguage: languageCode });
    });
    this.languages.set(this._data.languages);
    this._initFormGroup();
  }

  public emitValueChanges(): void {
    const values = this.languageFormGroup.value;
    if (this.languageFormGroup.invalid) return;
    this._translationDialogService.valueChanges$.next({
      sourceLanguage: values.sourceLanguage!,
      sourceText: values.sourceText!,
      targetLanguage: values.targetLanguage!,
    });
  }

  private _initFormGroup(): void {
    this.languageFormGroup.patchValue({
      sourceText: this._data.sourceText,
      targetLanguage: this._data.targetLanguageCode,
    });
  }

}
