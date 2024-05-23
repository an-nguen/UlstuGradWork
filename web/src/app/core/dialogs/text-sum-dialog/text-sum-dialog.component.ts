import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TextProcessingService } from '@core/services/text-processing.service';
import { catchError, finalize, throwError } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoadingSpinnerOverlayComponent } from '@shared/components/loading-spinner-overlay/loading-spinner-overlay.component';

interface DialogData {
  inputText: string;
}

@Component({
  selector: 'app-text-sum-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatSnackBarModule, LoadingSpinnerOverlayComponent],
  templateUrl: './text-sum-dialog.component.html',
  styleUrl: './text-sum-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextSumDialogComponent implements OnInit {

  public loading = signal<boolean>(false);
  public summarizedText = signal<string | null>(null);

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData,
    private readonly _dialogRef: MatDialogRef<TextSumDialogComponent>,
    private readonly _textProcessingService: TextProcessingService,
    private readonly _snackBar: MatSnackBar,
  ) {
  }

  public ngOnInit(): void {
    this.loading.set(true);
    this._textProcessingService.summarizeText({ text: this.dialogData.inputText })
      .pipe(
        catchError(err => {
          this._snackBar.open('Произошла ошибка :(', 'OK');
          return throwError(() => err);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(response => {
        console.log(response);
        this.summarizedText.set(response.summarizedText);
      });
  }

  public close(): void {
    this._dialogRef.close();
  }

}
