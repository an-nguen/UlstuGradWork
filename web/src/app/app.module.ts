import {
  CdkMenu,
  CdkMenuBar,
  CdkMenuItem,
  CdkMenuModule,
  CdkMenuTrigger,
} from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RouterLink, RouterOutlet, provideRouter, withEnabledBlockingInitialNavigation, withViewTransitions } from '@angular/router';
import { BookListItemComponent } from '@core/components/book-list-item/book-list-item.component';
import { BookListViewComponent } from '@core/components/book-list-view/book-list-view.component';
import { DeleteConfirmationDialogComponent } from '@core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { IconButtonComponent } from '@core/components/icon-button/icon-button.component';
import { MainLayoutComponent } from '@core/components/main-layout/main-layout.component';
import { TitlebarMenuComponent } from '@core/components/titlebar-menu-button/titlebar-menu.component';
import { TitlebarWindowButtonComponent } from '@core/components/titlebar-window-button/titlebar-window-button.component';
import { TitlebarComponent } from '@core/components/titlebar/titlebar.component';
import { ToolbarComponent } from '@core/components/toolbar/toolbar.component';
import { UserRegistrationDialogComponent } from '@core/components/user-registration-dialog/user-registration-dialog.component';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { httpErrorInterceptor } from '@core/interceptors/http-error.interceptor';
import { BookEditDetailsComponent } from '@core/pages/book-edit-details/book-edit-details.component';
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
    BookListItemComponent,
    BookListViewComponent,
    BookEditDetailsComponent,
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
  ],
  imports: [
    CommonModule,
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
    CdkMenu,
    CdkMenuBar,
    CdkMenuItem,
    CdkMenuTrigger,
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
