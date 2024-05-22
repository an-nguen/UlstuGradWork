import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
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
import { MainLayoutComponent } from '@core/components/main-layout/main-layout.component';
import { ToolbarComponent } from '@core/components/toolbar/toolbar.component';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { httpErrorInterceptor } from '@core/interceptors/http-error.interceptor';
import { provideAuthHttpClient } from '@core/providers/auth-http-client';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

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
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,
    MatSidenavModule,
  ],
  providers: [
    {
      provide: Window,
      useValue: window,
    },
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(),
      withViewTransitions(),
    ),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([httpErrorInterceptor, authInterceptor]),
    ),
    provideAuthHttpClient(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
