import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CONSTANTS } from '@core/constants';
import { AuthService } from '@core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  
  public routeLinks = [
    {
      iconCode: 'schedule',
      name: 'Недавние',
      link: CONSTANTS.ENDPOINTS.RECENT_BOOKS,
    },
    {
      iconCode: 'library_books',
      name: 'Все книги',
      link: CONSTANTS.ENDPOINTS.EXPLORER,
    },
  ];

  public isExpanded = false;
  
  public isHandset = toSignal(this._breakpointObserver.observe([Breakpoints.Handset])
    .pipe(map((result) => result.matches)));
  
  constructor(
    private readonly _authService: AuthService,
    private readonly _snackBar: MatSnackBar,
    private readonly _breakpointObserver: BreakpointObserver, 
    private readonly _router: Router
  ) {}

  public toggleSidenav(): void {
    this.isExpanded = !this.isExpanded;
  }

  public signOut(): void {
    this._authService.signOut().subscribe(() => {
      this._snackBar.open('Вы вышли из системы.', 'OK', { duration: 1500 });
      this._router.navigate([
        CONSTANTS.ENDPOINTS.AUTH.PATH,
        CONSTANTS.ENDPOINTS.AUTH.SIGN_IN,
      ]);
    });
  }
  
}
