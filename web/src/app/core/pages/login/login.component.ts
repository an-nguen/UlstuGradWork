import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CONSTANTS } from '@core/constants';
import { UserRegistrationDialogComponent } from '@core/dialogs/user-registration-dialog/user-registration-dialog.component';
import { UserAddRequest, UserDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { AuthState } from '@core/stores/auth.state';
import { catchError, mergeMap, NEVER, Observable, throwError } from 'rxjs';
import { DigitOnlyModule } from '@uiowa/digit-only';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel, MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [
    DigitOnlyModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatIcon,
    ReactiveFormsModule,
    UserRegistrationDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  
  public users = signal<UserDto[]>([]);

  public loginForm = this._fb.group({
    selectedUser: this._fb.control<UserDto | null>(null, [Validators.required]),
    pinCode: this._fb.control<string | null>(null, [
      Validators.required,
      Validators.pattern(CONSTANTS.REGEX_PATTERN.PIN_CODE),
    ]),
  });

  constructor(
    private readonly _service: UserService,
    private readonly _authState: AuthState,
    private readonly _authService: AuthService,
    private readonly _snackBar: MatSnackBar,
    private readonly _dialog: MatDialog,
    private readonly _fb: NonNullableFormBuilder,
    private readonly _router: Router,
    private readonly _destroyRef: DestroyRef
  ) {}

  public ngOnInit(): void {
    if (this._authState.isSignedIn()) {
      this._routeToMainPage();
    }
    this.loadUsers();
  }

  public loadUsers(): void {
    this._service
      .getUsers()
      .pipe(
        catchError((err) => {
          this._snackBar.open(
            'Не удалось загрузить список пользователей.',
            'OK'
          );
          return throwError(() => err);
        })
      )
      .subscribe((users) => {
        this.users.set(users);
      });
  }

  public login(): void {
    const values = this.loginForm.value;
    const username = values.selectedUser?.name;
    const password = values.pinCode;

    if (this.loginForm.invalid) {
      this._snackBar.open('The username or password field is empty!', 'OK');
      return;
    }

    if (!!username && !!password) {
      this._authService
        .signIn(username, password)
        .pipe(catchError((err) => this._handleSignInError(err)))
        .subscribe(() => {
          this._routeToMainPage();
        });
    }
  }

  public createUser(): void {
    const dialogRef = this._dialog.open(UserRegistrationDialogComponent);
    dialogRef
      .afterClosed()
      .pipe(
        mergeMap((newUser: UserAddRequest | undefined) => {
          if (!newUser) return NEVER;
          return this._service.addUser(newUser);
        }),
        catchError((err) => {
          console.error(`Failed to create user: ${err}`);
          this._snackBar.open(
            `Произошла ошибка при создании пользователя: ${err}`
          );
          return throwError(() => err);
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((user) => {
        this._snackBar.open(`Пользователь ${user.name} создан!`, 'OK');
        this.loadUsers();
      });
  }

  private _routeToMainPage() {
    this._router.navigate([CONSTANTS.ENDPOINTS.RECENT_BOOKS]);
  }

  private _handleSignInError(err: unknown): Observable<never> {
    if (err instanceof HttpErrorResponse && err.status === 401) {
      const errorMessage = (err.error as Record<string, string>)['message'];
      this.loginForm.setErrors({
        invalidUsernameOrPassword: errorMessage,
      });
      this._snackBar.open(errorMessage, 'OK');
    }
    return throwError(() => err);
  }
  
}
