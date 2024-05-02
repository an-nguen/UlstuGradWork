import { Routes } from '@angular/router';
import { CONSTANTS } from '@core/constants';
import { BookEditDetailsComponent } from '@core/pages/book-edit-details/book-edit-details.component';
import { BookViewerComponent } from '@core/pages/book-viewer/book-viewer.component';
import { LibraryExplorerComponent } from '@core/pages/library-explorer/library-explorer.component';
import { UserSelectionComponent } from '@core/pages/user-selection/user-selection.component';

export const routes: Routes = [
  {
    path: '',
    component: UserSelectionComponent,
  },
  {
    path: CONSTANTS.URL_PATHS.NO_CONNECTION,
    loadComponent: () =>
      import('./core/pages/no-connection/no-connection.component').then(
        (m) => m.NoConnectionComponent
      ),
  },
  {
    path: CONSTANTS.URL_PATHS.EXPLORER,
    component: LibraryExplorerComponent,
  },
  {
    path: CONSTANTS.URL_PATHS.VIEWER,
    component: BookViewerComponent,
  },
  {
    path: CONSTANTS.URL_PATHS.EDIT_DETAILS,
    component: BookEditDetailsComponent,
  },
];
