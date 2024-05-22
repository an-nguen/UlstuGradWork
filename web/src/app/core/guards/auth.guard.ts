import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CONSTANTS } from '@core/constants';
import { AuthState } from '@core/stores/auth.state';
import { AuthService } from '@core/services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (_, state) => {
  const authState = inject(AuthState);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authState.isSignedIn()) {
    return true;
  } else {
    return authService.refreshToken()
      .pipe(
        map((isSignedIn) =>
          router.parseUrl(
            !isSignedIn
              ? `/${CONSTANTS.ENDPOINTS.AUTH.PATH}/${CONSTANTS.ENDPOINTS.AUTH.SIGN_IN}`
              : state.url,
          )),
      );
  }
};
