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
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RouterLink, RouterOutlet, provideRouter, withEnabledBlockingInitialNavigation, withViewTransitions } from '@angular/router';
import { BookEditDialogComponent } from '@core/components/book-edit-dialog/book-edit-dialog.component';
import { BookListItemComponent } from '@core/components/book-list-item/book-list-item.component';
import { BookListViewComponent } from '@core/components/book-list-view/book-list-view.component';
import { DeleteConfirmationDialogComponent } from '@core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { IconButtonComponent } from '@core/components/icon-button/icon-button.component';
import { MainLayoutComponent } from '@core/components/main-layout/main-layout.component';
import { SortMenuComponent } from '@core/components/sort-menu/sort-menu.component';
import { TitlebarMenuComponent } from '@core/components/titlebar-menu-button/titlebar-menu.component';
import { TitlebarWindowButtonComponent } from '@core/components/titlebar-window-button/titlebar-window-button.component';
import { TitlebarComponent } from '@core/components/titlebar/titlebar.component';
import { ToolbarComponent } from '@core/components/toolbar/toolbar.component';
import { UserRegistrationDialogComponent } from '@core/components/user-registration-dialog/user-registration-dialog.component';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { httpErrorInterceptor } from '@core/interceptors/http-error.interceptor';
import { BookViewerComponent } from '@core/pages/book-viewer/book-viewer.component';
import { LibraryExplorerComponent } from '@core/pages/library-explorer/library-explorer.component';
import { LoginComponent } from '@core/pages/login/login.component';
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
    BookListItemComponent,
    BookListViewComponent,
    DeleteConfirmationDialogComponent,
    ToolbarComponent,
    TitlebarComponent,
    TitlebarWindowButtonComponent,
    TitlebarMenuComponent,
    MainLayoutComponent,
    LibraryExplorerComponent,
    BookViewerComponent,
    LoginComponent,
    UserRegistrationDialogComponent,
    SortMenuComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    RouterOutlet,
    RouterLink,
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
