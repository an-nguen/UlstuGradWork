import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CONSTANTS } from '@core/constants';

@Component({
  selector: 'app-user-registration-dialog',
  templateUrl: './user-registration-dialog.component.html',
  styleUrl: './user-registration-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRegistrationDialogComponent {

  public createUserForm = this._fb.group({
    name: this._fb.control('', [Validators.required]),
    pinCode: this._fb.control('', [Validators.required, Validators.pattern(CONSTANTS.REGEX_PATTERN.PIN_CODE)])
  });

  constructor(
    private readonly _dialogRef: MatDialogRef<UserRegistrationDialogComponent>,
    private readonly _fb: NonNullableFormBuilder
  ) { }

  public cancel(): void {
    this._dialogRef.close();
  }
  public create(): void {
    if (this.createUserForm.invalid) return;
    this._dialogRef.close(this.createUserForm.value);
  }

}
