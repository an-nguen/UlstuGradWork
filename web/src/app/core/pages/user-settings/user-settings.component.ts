import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CONSTANTS } from '@core/constants';
import { UserService } from '@core/services/user.service';
import { AuthState } from '@core/stores/auth.state';
import { DigitOnlyModule } from '@uiowa/digit-only';
import { jwtDecode } from 'jwt-decode';

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

  public passwordFormGroup = this._fb.group({
    currentPINCode: this._fb.control<string | null>(null, Validators.pattern(CONSTANTS.REGEX_PATTERN.PIN_CODE)),
    newPINCode: this._fb.control<string | null>(null, Validators.pattern(CONSTANTS.REGEX_PATTERN.PIN_CODE)),
  });

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _authState: AuthState,
    private readonly _userService: UserService,
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
    this._userService.updateUser(
      userId, 
      { 
        newPINCode, 
        currentPINCode 
      }
    );
  }

}
