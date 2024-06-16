import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CONSTANTS } from '@core/constants';
import { UserService } from '@core/services/user.service';
import { AuthState } from '@core/stores/auth.state';
import { DigitOnlyModule } from '@uiowa/digit-only';
import { jwtDecode } from 'jwt-decode';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DigitOnlyModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSettingsComponent {

  protected readonly INVALID_PIN_ERR_MSG = "Неверный ПИН-код";

  public passwordFormGroup = this._fb.group({
    currentPINCode: this._fb.control<string | null>(null, Validators.pattern(CONSTANTS.REGEX_PATTERN.PIN_CODE)),
    newPINCode: this._fb.control<string | null>(null, Validators.pattern(CONSTANTS.REGEX_PATTERN.PIN_CODE)),
  });

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _fb: FormBuilder,
    private readonly _authState: AuthState,
    private readonly _userService: UserService,
    private readonly _snackBar: MatSnackBar,
  ) { }

  public changePassword(): void {
    const accessToken = this._authState.accessToken;
    if (!accessToken) return;
    const decoded = jwtDecode(accessToken);
    const userId = decoded.sub;
    const currentPINCode = this.passwordFormGroup.value.currentPINCode;
    const newPINCode = this.passwordFormGroup.value.newPINCode;
    if (!currentPINCode || !newPINCode || !userId) {
      return;
    }
    const request = { newPINCode, currentPINCode };
    this._userService.updateUser(userId, request)
      .pipe(
        catchError((err) => {
          if (err instanceof HttpErrorResponse) {
            this.passwordFormGroup.controls.currentPINCode.setErrors({
              invalid: true,
            });
            this._cdr.markForCheck();
          }
          return throwError(() => err);
        })
      )
      .subscribe(() => {
        this.passwordFormGroup.controls.currentPINCode.setErrors({ invalid: false });
        this.passwordFormGroup.reset();
        this._snackBar.open('ПИН-код успешно изменён.');
      });
  }

}
