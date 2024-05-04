import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '@core/stores/auth.state';

export const loginGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);
  if (!authState.isSignedIn()) {
    return true;
  }

  return router.parseUrl('/');
};
