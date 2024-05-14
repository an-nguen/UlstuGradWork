import { ChangeDetectionStrategy, Component, DestroyRef, Inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LanguageDto, TranslationRequestDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { TextProcessingService } from '@core/services/text-processing.service';
import { finalize } from 'rxjs';

export interface TranslationDialogComponentData {
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

  public loading = signal<boolean>(false);

  public translatedText = signal<string | null>(null);

  public languageFormGroup = this._fb.group({
    sourceLanguage: this._fb.control<string | null>(null, [Validators.required]),
    sourceText: this._fb.control<string | null>(null, { updateOn: 'blur', validators: [Validators.required] },),
    targetLanguage: this._fb.control<string | null>(null, [Validators.required]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: TranslationDialogComponentData,
    private readonly _textProcessingService: TextProcessingService,
    private readonly _fb: FormBuilder,
    private readonly _destroyRef: DestroyRef,
  ) { }

  public ngOnInit(): void {
    this._determineSourceTextLanguage();
    this.languageFormGroup.valueChanges.pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(() => {
      this.translateText();
    });
    this._initFormGroup();
  }

  public get languages(): LanguageDto[] {
    return this._textProcessingService.availableLanguages();
  }

  public translateText(): void {
    const values = this.languageFormGroup.value;
    if (this.languageFormGroup.invalid) return;
    const request: TranslationRequestDto = {
      sourceLanguage: values.sourceLanguage!,
      sourceText: values.sourceText!,
      targetLanguage: values.targetLanguage!,
    };
    this.loading.set(true);
    this._textProcessingService.translate(request)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((response) => this.translatedText.set(response.translatedText));
  }

  private _determineSourceTextLanguage(): void {
    this._textProcessingService.detectLanguage({ text: this._data.sourceText })
      .subscribe((response) => this.languageFormGroup.patchValue({ sourceLanguage: response.detectedLanguageCode }));
  }

  private _initFormGroup(): void {
    this.languageFormGroup.patchValue({
      sourceText: this._data.sourceText,
      targetLanguage: this._data.targetLanguageCode,
    });
  }

}
