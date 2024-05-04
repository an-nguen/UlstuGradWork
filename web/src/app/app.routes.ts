import { Routes } from '@angular/router';
import { CONSTANTS } from '@core/constants';
import { authGuard } from '@core/guards/auth.guard';
import { loginGuard } from '@core/guards/login.guard';
import { BookEditDetailsComponent } from '@core/pages/book-edit-details/book-edit-details.component';
import { BookViewerComponent } from '@core/pages/book-viewer/book-viewer.component';
import { LibraryExplorerComponent } from '@core/pages/library-explorer/library-explorer.component';
import { LoginComponent } from '@core/pages/login/login.component';

export const routes: Routes = [
  {
    path: '',
    component: LibraryExplorerComponent,
  },
  {
    path: CONSTANTS.ENDPOINTS.VIEWER,
    canActivate: [authGuard],
    component: BookViewerComponent,
  },
  {
    path: CONSTANTS.ENDPOINTS.EDIT_DETAILS,
    canActivate: [authGuard],
    component: BookEditDetailsComponent,
  },
  {
    path: `${CONSTANTS.ENDPOINTS.AUTH.PATH}/${CONSTANTS.ENDPOINTS.AUTH.SIGN_IN}`,
    canActivate: [loginGuard],
    component: LoginComponent,
  },
  {
    path: CONSTANTS.ENDPOINTS.NO_CONNECTION,
    loadComponent: () =>
      import('./core/pages/no-connection/no-connection.component').then(
        (m) => m.NoConnectionComponent
      ),
  },
];
