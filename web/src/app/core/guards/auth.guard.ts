import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CONSTANTS } from '@core/constants';
import { AuthState } from '@core/stores/auth.state';

export const authGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (authState.isSignedIn()) {
    return true;
  } else {
    return router.parseUrl(
      `/${CONSTANTS.ENDPOINTS.AUTH.PATH}/${CONSTANTS.ENDPOINTS.AUTH.SIGN_IN}`
    );
  }
};
