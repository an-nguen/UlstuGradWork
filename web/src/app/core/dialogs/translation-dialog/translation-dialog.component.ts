import { ChangeDetectionStrategy, Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { LoadingSpinnerOverlayComponent } from '@shared/components/loading-spinner-overlay/loading-spinner-overlay.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslationFormChangeEvent, TranslationDialogComponentData, TranslationDialogService } from '@core/services/translation-dialog.service';
import { LanguageDto } from '@core/dtos/BookManager.Application.Common.DTOs';

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

  public readonly languages: LanguageDto[];
  public readonly state = this._service.stateSignal;
  public readonly languageFormGroup = this._fb.group({
    sourceLanguage: this._fb.control<string | null>(null, [Validators.required]),
    sourceText: this._fb.control<string | null>(null, { updateOn: 'blur', validators: [Validators.required] }),
    targetLanguage: this._fb.control<string | null>(null, [Validators.required]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: TranslationDialogComponentData,
    private readonly _service: TranslationDialogService,
    private readonly _fb: FormBuilder,
    private readonly _destroyRef: DestroyRef,
  ) {
    this.languages = this._data.availableLanguages;
  }

  public ngOnInit(): void {
    this._subscribeToFormChanges();
    this._initFormGroup();
  }

  public translateText(): void {
    const values = this.languageFormGroup.value;
    if (this.languageFormGroup.invalid) return;
    const event: TranslationFormChangeEvent = {
      sourceLanguage: values.sourceLanguage!,
      sourceText: values.sourceText!,
      targetLanguage: values.targetLanguage!,
    };
    this._service.emitTranslationFormChangeEvent(event);

  }

  public swapLanguages(): void {
    const selectedSourceLangCode = this.languageFormGroup.value.sourceLanguage;
    const selectedTargetLangCode = this.languageFormGroup.value.targetLanguage;
    this.languageFormGroup.patchValue({
      sourceLanguage: selectedTargetLangCode,
      targetLanguage: selectedSourceLangCode,
    });
  }

  private _initFormGroup(): void {
    this.languageFormGroup.patchValue({
      sourceLanguage: this._data.sourceLanguage,
      sourceText: this._data.sourceText,
      targetLanguage: this._data.targetLanguage,
    });
  }

  private _subscribeToFormChanges(): void {
    this.languageFormGroup.valueChanges
      .pipe(
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(() => this.translateText());
  }

}
