import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserCreationDialogComponent } from '@core/components/user-creation-dialog/user-creation-dialog.component';
import { CONSTANTS } from '@core/constants';
import { UserAddRequest, UserDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { UserService } from '@core/services/user.service';
import { NEVER, catchError, mergeMap, throwError } from 'rxjs';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserLoginComponent implements OnInit {

  public users = signal<UserDto[]>([]);

  public loginForm = this._fb.group({
    selectedUser: this._fb.control<UserDto | null>(null, [Validators.required]),
    pinCode: this._fb.control<string | null>(null, [Validators.required, Validators.pattern(CONSTANTS.REGEX_PATTERN.PIN_CODE)]),
  });

  constructor(
    private readonly _service: UserService,
    private readonly _snackBar: MatSnackBar,
    private readonly _dialog: MatDialog,
    private readonly _fb: NonNullableFormBuilder,
    private readonly _router: Router,
    private readonly _destroyRef: DestroyRef
  ) { }

  public ngOnInit(): void {
    this.loadUsers();
  }

  public loadUsers(): void {
    this._service.getUsers()
      .pipe(catchError((err) => {
        this._snackBar.open('Не удалось загрузить список пользователей.', 'OK');
        return throwError(() => err);
      }))
      .subscribe((users) => {
        this.users.set(users);
      });
  }

  public login(): void {
    this._router.navigate([CONSTANTS.URL_PATHS.EXPLORER]);
  }

  public createUser(): void {
    const dialogRef = this._dialog.open(UserCreationDialogComponent);
    dialogRef.afterClosed()
      .pipe(
        mergeMap((newUser: UserAddRequest | undefined) => {
          if (!newUser) return NEVER;
          return this._service.addUser(newUser);
        }),
        catchError((err) => {
          console.error(`Failed to create user: ${err}`);
          this._snackBar.open(`Произошла ошибка при создании пользователя: ${err}`);
          return throwError(() => err);
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((user) => {
        this._snackBar.open(`Пользователь ${user.name} создан!`, 'OK');
        this.loadUsers();
      });
  }

}
