import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '@core/stores/auth.state';
import { AuthService } from '@core/services/auth.service';
import { map } from 'rxjs';
import { SIGN_IN } from '@core/constants/route-paths.constant';

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
              ? SIGN_IN
              : state.url,
          )),
      );
  }
};
