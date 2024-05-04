import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthState } from '@core/stores/auth.state';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthState);
  if (authState.isSignedIn()) {
    const headers = {
      Authorization: `Bearer ${authState.accessToken}`,
    };
    const request = req.clone({ setHeaders: headers, withCredentials: true });
    return next(request);
  }
  return next(req);
};
