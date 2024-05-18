import { ClipboardModule } from '@angular/cdk/clipboard';
import { CdkMenu, CdkMenuBar, CdkMenuItem, CdkMenuModule, CdkMenuTrigger } from '@angular/cdk/menu';
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
import {
  provideRouter,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  withEnabledBlockingInitialNavigation,
  withViewTransitions,
} from '@angular/router';
import { IconButtonComponent } from '@core/components/icon-button/icon-button.component';
import { MainLayoutComponent } from '@core/components/main-layout/main-layout.component';
import { ToolbarComponent } from '@core/components/toolbar/toolbar.component';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { httpErrorInterceptor } from '@core/interceptors/http-error.interceptor';
import { provideAuthHttpClient } from '@core/providers/auth-http-client';
import { AuthService } from '@core/services/auth.service';
import { LoadingSpinnerOverlayComponent } from '@shared/components/loading-spinner-overlay/loading-spinner-overlay.component';
import { DigitOnlyModule } from '@uiowa/digit-only';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
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
    MainLayoutComponent,
    ToolbarComponent,
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
    InfiniteScrollModule,
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
      useValue: window,
    },
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(),
      withViewTransitions()
    ),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([httpErrorInterceptor, authInterceptor])
    ),
    provideAuthHttpClient(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
