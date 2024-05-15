import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CONSTANTS } from '@core/constants';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {

  protected readonly SIDENAV_COLLAPSED_WIDTH = 48;
  protected readonly SIDENAV_EXPANDED_WIDTH = 240;

  public routeLinks = [
    {
      iconCode: 'schedule',
      name: 'Недавние',
      link: CONSTANTS.ENDPOINTS.RECENT_BOOKS
    },
    {
      iconCode: 'library_books',
      name: 'Все книги',
      link: CONSTANTS.ENDPOINTS.EXPLORER
    },
  ];

  public isExpanded = false;

  constructor(
    private readonly _authService: AuthService,
    private readonly _snackBar: MatSnackBar,
    private readonly _router: Router,
  ) { }

  public toggleSidenav(): void {
    this.isExpanded = !this.isExpanded;
  }

  public signOut(): void {
    this._authService.signOut()
      .subscribe(() => {
        this._snackBar.open('Вы вышли из системы.', 'OK', { duration: 1500 });
        this._router.navigate([CONSTANTS.ENDPOINTS.AUTH.PATH, CONSTANTS.ENDPOINTS.AUTH.SIGN_IN]);
      });
  }

}
