import { ClipboardModule } from '@angular/cdk/clipboard';
import {
  CdkMenu,
  CdkMenuBar,
  CdkMenuItem,
  CdkMenuModule,
  CdkMenuTrigger,
} from '@angular/cdk/menu';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RouterLink, RouterLinkActive, RouterOutlet, provideRouter, withEnabledBlockingInitialNavigation, withViewTransitions } from '@angular/router';
import { BookGridItemComponent } from '@core/components/book-grid-item/book-grid-item.component';
import { BookGridViewComponent } from '@core/components/book-grid-view/book-grid-view.component';
import { BookListItemComponent } from '@core/components/book-list-item/book-list-item.component';
import { BookListViewComponent } from '@core/components/book-list-view/book-list-view.component';
import { CustomPdfFindBtnComponent } from '@core/components/custom-pdf-find-btn/custom-pdf-find-btn.component';
import { IconButtonComponent } from '@core/components/icon-button/icon-button.component';
import { MainLayoutComponent } from '@core/components/main-layout/main-layout.component';
import { SortMenuComponent } from '@core/components/sort-menu/sort-menu.component';
import { TitlebarMenuComponent } from '@core/components/titlebar-menu-button/titlebar-menu.component';
import { TitlebarWindowButtonComponent } from '@core/components/titlebar-window-button/titlebar-window-button.component';
import { TitlebarComponent } from '@core/components/titlebar/titlebar.component';
import { ToolbarComponent } from '@core/components/toolbar/toolbar.component';
import { TooltipMenuComponent } from '@core/components/tooltip-menu/tooltip-menu.component';
import { BookEditDialogComponent } from '@core/dialogs/book-edit-dialog/book-edit-dialog.component';
import { DeleteConfirmationDialogComponent } from '@core/dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { TranslationDialogComponent } from '@core/dialogs/translation-dialog/translation-dialog.component';
import { UserRegistrationDialogComponent } from '@core/dialogs/user-registration-dialog/user-registration-dialog.component';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { httpErrorInterceptor } from '@core/interceptors/http-error.interceptor';
import { BookViewerComponent } from '@core/pages/book-viewer/book-viewer.component';
import { LibraryExplorerComponent } from '@core/pages/library-explorer/library-explorer.component';
import { LoginComponent } from '@core/pages/login/login.component';
import { RecentBooksComponent } from '@core/pages/recent-books/recent-books.component';
import { provideAuthHttpClient } from '@core/providers/auth-http-client';
import { AuthService } from '@core/services/auth.service';
import { LoadingSpinnerOverlayComponent } from '@shared/components/loading-spinner-overlay/loading-spinner-overlay.component';
import { DigitOnlyModule } from '@uiowa/digit-only';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { Observable } from 'rxjs';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

function initAppFactory(authService: AuthService): () => Observable<any> {
  return () => {
    return authService.refreshToken();
  };
}

@NgModule({
  declarations: [
    AppComponent,
    BookEditDialogComponent,
    BookGridItemComponent,
    BookGridViewComponent,
    BookListItemComponent,
    BookListViewComponent,
    BookViewerComponent,
    CustomPdfFindBtnComponent,
    DeleteConfirmationDialogComponent,
    LibraryExplorerComponent,
    LoginComponent,
    MainLayoutComponent,
    SortMenuComponent,
    TitlebarComponent,
    TitlebarMenuComponent,
    TitlebarWindowButtonComponent,
    ToolbarComponent,
    TooltipMenuComponent,
    TranslationDialogComponent,
    RecentBooksComponent,
    UserRegistrationDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatDialogModule,
    MatTooltipModule,
    MatRadioModule,
    MatSidenavModule,
    MatMenuModule,
    MatProgressBarModule,
    ClipboardModule,
    CdkMenu,
    CdkMenuBar,
    CdkMenuItem,
    CdkMenuTrigger,
    OverlayModule,
    DigitOnlyModule,
    IconButtonComponent,
    CdkMenuModule,
    NgxExtendedPdfViewerModule,
    LoadingSpinnerOverlayComponent,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initAppFactory,
      deps: [AuthService],
      multi: true,
    },
    {
      provide: Window,
      useValue: window
    },
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(),
      withViewTransitions()
    ),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([httpErrorInterceptor, authInterceptor])),
    provideAuthHttpClient(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
