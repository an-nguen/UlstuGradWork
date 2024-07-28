import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/api/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { BOOK_COLLECTIONS, DICTIONARY, EXPLORER, RECENT_BOOKS, SIGN_IN, USER_SETTINGS } from '@core/constants/route-paths.constant';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {

  protected readonly USER_SETTINGS_ROUTER_LINK = USER_SETTINGS;

  public routeLinks = [
    {
      iconCode: 'schedule',
      name: 'Недавние',
      link: RECENT_BOOKS,
    },
    {
      iconCode: 'library_books',
      name: 'Все книги',
      link: EXPLORER,
    },
    {
      iconCode: 'category',
      name: 'Коллекции',
      link: BOOK_COLLECTIONS,
    },
    {
      iconCode: 'abc',
      name: 'Словарь',
      link: DICTIONARY
    }
  ];

  public isExpanded = false;

  public isHandset = toSignal(this._breakpointObserver.observe([Breakpoints.Handset])
    .pipe(map((result) => result.matches)));

  public isSignedIn = toSignal(this._authService.isSignedIn$);

  constructor(
    private readonly _authService: AuthService,
    private readonly _snackBar: MatSnackBar,
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _router: Router,
  ) {
  }

  public toggleSidenav(): void {
    this.isExpanded = !this.isExpanded;
  }

  public signOut(): void {
    this._authService.signOut()
      .subscribe(() => {
        this._snackBar.open('Вы вышли из системы.', 'OK', { duration: 1500 });
        this._router.navigate([SIGN_IN]);
      });
  }

}
