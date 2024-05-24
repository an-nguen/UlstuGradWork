import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { CONSTANTS } from '@core/constants';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { DigitOnlyModule } from '@uiowa/digit-only';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-user-registration-dialog',
  templateUrl: './user-registration-dialog.component.html',
  styleUrl: './user-registration-dialog.component.scss',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatInputModule,
    MatLabel,
    ReactiveFormsModule,
    MatButton,
    DigitOnlyModule,
    MatDialogActions,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegistrationDialogComponent {
  
  public createUserForm = this._fb.group({
    name: this._fb.control('', [Validators.required]),
    pinCode: this._fb.control('', [
      Validators.required,
      Validators.pattern(CONSTANTS.REGEX_PATTERN.PIN_CODE),
    ]),
  });

  constructor(
    private readonly _dialogRef: MatDialogRef<UserRegistrationDialogComponent>,
    private readonly _fb: NonNullableFormBuilder
  ) {}

  public cancel(): void {
    this._dialogRef.close();
  }
  public create(): void {
    if (this.createUserForm.invalid) return;
    this._dialogRef.close(this.createUserForm.value);
  }
  
}
