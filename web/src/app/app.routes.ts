import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { loginGuard } from '@core/guards/login.guard';
import * as RoutePaths from '@core/constants/route-paths.constant';

export const routes: Routes = [
  {
    path: RoutePaths.RECENT_BOOKS,
    canActivate: [authGuard],
    loadComponent: () => import('@core/pages/recent-books/recent-books.component')
      .then(m => m.RecentBooksComponent),
  },
  {
    path: RoutePaths.EXPLORER,
    canActivate: [authGuard],
    loadComponent: () => import('@core/pages/library-explorer/library-explorer.component')
      .then(m => m.LibraryExplorerComponent),
  },
  {
    path: RoutePaths.BOOK_COLLECTIONS,
    canActivate: [authGuard],
    loadComponent: () => import('@core/pages/book-collections/book-collections.component')
      .then(m => m.BookCollectionsComponent)
  },
  {
    path: RoutePaths.DICTIONARY,
    canActivate: [authGuard],
    loadComponent: () => import('@core/pages/dictionary-explorer/dictionary-explorer.component')
      .then(m => m.DictionaryExplorerComponent)
  },
  {
    path: RoutePaths.VIEWER,
    canActivate: [authGuard],
    loadComponent: () => import('@core/pages/book-viewer/book-viewer.component')
      .then(m => m.BookViewerComponent),
  },
  {
    path: RoutePaths.SIGN_IN,
    canActivate: [loginGuard],
    loadComponent: () => import('@core/pages/login/login.component')
      .then(m => m.LoginComponent),
  },
  {
    path: RoutePaths.USER_SETTINGS,
    canActivate: [authGuard],
    loadComponent: () => import('./core/pages/user-settings/user-settings.component')
      .then((m) => m.UserSettingsComponent)
  },
  {
    path: RoutePaths.NO_CONNECTION,
    loadComponent: () => import('./core/pages/no-connection/no-connection.component')
      .then((m) => m.NoConnectionComponent),
  },
];
