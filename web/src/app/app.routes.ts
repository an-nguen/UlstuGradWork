import { Routes } from '@angular/router';
import { CONSTANTS } from '@core/constants';
import { authGuard } from '@core/guards/auth.guard';
import { loginGuard } from '@core/guards/login.guard';

export const routes: Routes = [
  {
    path: CONSTANTS.ENDPOINTS.RECENT_BOOKS,
    canActivate: [authGuard],
    loadComponent: () => import('@core/pages/recent-books/recent-books.component')
      .then(m => m.RecentBooksComponent),
  },
  {
    path: CONSTANTS.ENDPOINTS.EXPLORER,
    canActivate: [authGuard],
    loadComponent: () => import('@core/pages/library-explorer/library-explorer.component')
      .then(m => m.LibraryExplorerComponent),
  },
  {
    path: CONSTANTS.ENDPOINTS.BOOK_COLLECTIONS,
    canActivate: [authGuard],
    loadComponent: () => import('@core/pages/book-collections/book-collections.component')
      .then(m => m.BookCollectionsComponent)
  },
  {
    path: CONSTANTS.ENDPOINTS.VIEWER,
    canActivate: [authGuard],
    loadComponent: () => import('@core/pages/book-viewer/book-viewer.component')
      .then(m => m.BookViewerComponent),
  },
  {
    path: `${CONSTANTS.ENDPOINTS.AUTH.PATH}/${CONSTANTS.ENDPOINTS.AUTH.SIGN_IN}`,
    canActivate: [loginGuard],
    loadComponent: () => import('@core/pages/login/login.component')
      .then(m => m.LoginComponent),
  },
  {
    path: CONSTANTS.ENDPOINTS.NO_CONNECTION,
    loadComponent: () =>
      import('./core/pages/no-connection/no-connection.component').then(
        (m) => m.NoConnectionComponent
      ),
  },
];
