import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth';

export const registeredUserGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isGuestMode()) {
    return router.createUrlTree(['/app/dashboard']);
  }

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  return true;
};
