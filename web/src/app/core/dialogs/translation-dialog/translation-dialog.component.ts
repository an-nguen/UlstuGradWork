import { ChangeDetectionStrategy, Component, DestroyRef, Inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { LanguageDto, TranslationRequestDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { TextProcessingService } from '@core/services/text-processing.service';
import { finalize } from 'rxjs';
import { MatFormField } from '@angular/material/form-field';
import { MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { LoadingSpinnerOverlayComponent } from '@shared/components/loading-spinner-overlay/loading-spinner-overlay.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

interface TranslationDialogComponentData {
  sourceText: string;
  targetLanguageCode: string;
}

@Component({
  selector: 'app-translation-dialog',
  templateUrl: './translation-dialog.component.html',
  styleUrl: './translation-dialog.component.scss',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatLabel,
    MatFormField,
    MatSelect,
    MatOption,
    MatButtonModule,
    CdkTextareaAutosize,
    ReactiveFormsModule,
    LoadingSpinnerOverlayComponent,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranslationDialogComponent implements OnInit {

  public loading = signal<boolean>(false);
  public translatedText = signal<string | null>(null);

  public languageFormGroup = this._fb.group({
    sourceLanguage: this._fb.control<string | null>(null, [
      Validators.required,
    ]),
    sourceText: this._fb.control<string | null>(null, {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
    targetLanguage: this._fb.control<string | null>(null, [
      Validators.required,
    ]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: TranslationDialogComponentData,
    private readonly _textProcessingService: TextProcessingService,
    private readonly _fb: FormBuilder,
    private readonly _destroyRef: DestroyRef,
  ) {
    this._initFormGroup();
  }

  public get languages(): LanguageDto[] {
    return this._textProcessingService.availableLanguages();
  }

  public ngOnInit(): void {
    this._determineSourceTextLanguage();
    this._subscribeOnFormChanges();
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
    this._textProcessingService
      .translate(request)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((response) =>
        this.translatedText.set(response.translatedText),
      );
  }

  public swapLanguages(): void {
    const selectedSourceLangCode = this.languageFormGroup.value.sourceLanguage;
    const selectedTargetLangCode = this.languageFormGroup.value.targetLanguage;
    this.languageFormGroup.patchValue({
      sourceLanguage: selectedTargetLangCode,
      targetLanguage: selectedSourceLangCode,
    });
  }

  private _determineSourceTextLanguage(): void {
    this._textProcessingService
      .detectLanguage({ text: this._data.sourceText })
      .subscribe((response) =>
        this.languageFormGroup.patchValue({
          sourceLanguage: response.detectedLanguageCode,
        }),
      );
  }

  private _initFormGroup(): void {
    this.languageFormGroup.patchValue({
      sourceText: this._data.sourceText,
      targetLanguage: this._data.targetLanguageCode,
    });
  }

  private _subscribeOnFormChanges() {
    this.languageFormGroup.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.translateText());
  }

}
