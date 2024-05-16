import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import {
  EnvironmentInjector,
  inject,
  runInInjectionContext,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CONSTANTS } from '@core/constants';
import { AuthService } from '@core/services/auth.service';
import { AuthState } from '@core/stores/auth.state';
import { NEVER, Observable, catchError, mergeMap, throwError } from 'rxjs';

const handleUnauthorizedError = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  err: HttpErrorResponse,
  environmentInjector: EnvironmentInjector
): Observable<HttpEvent<unknown>> => {
  return runInInjectionContext(environmentInjector, () => {
    const authService = inject(AuthService);
    const authState = inject(AuthState);
    const router = inject(Router);

    return authService.refreshToken().pipe(
      mergeMap((success) => {
        if (!success) {
          authState.accessToken = null;
          routeToSignInPage(router);
          return throwError(() => err);
        }
        return next(req);
      })
    );
  });
};

const routeToSignInPage = (router: Router) => {
  router.navigate([
    CONSTANTS.ENDPOINTS.AUTH.PATH,
    CONSTANTS.ENDPOINTS.AUTH.SIGN_IN,
  ]);
};

export const AUTH_REQ = new HttpContextToken<boolean>(() => false);

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const environmentInjector = inject(EnvironmentInjector);
  const router = inject(Router);
  const snackBarService = inject(MatSnackBar);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 0) {
        router.navigate([CONSTANTS.ENDPOINTS.NO_CONNECTION]);
      } else {
        if (
          err.status === HttpStatusCode.Accepted ||
          err.status === HttpStatusCode.Created
        ) {
          return NEVER;
        } else if (err.status === HttpStatusCode.Unauthorized) {
          return handleUnauthorizedError(req, next, err, environmentInjector);
        } else {
          snackBarService.open(
            `HTTP error from API ${err.status}: ${err.statusText}`,
            'OK'
          );
        }
      }
      return throwError(() => err);
    })
  );
};
