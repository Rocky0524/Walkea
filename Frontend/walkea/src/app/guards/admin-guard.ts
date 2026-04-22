import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const rol = String(localStorage.getItem('rol') ?? '').trim().toLowerCase();
  const email = String(localStorage.getItem('email') ?? '').trim().toLowerCase();

  if (rol === 'admin' || rol === 'administrador' || email === 'admin@walkea.com') {
    return true;
  }

  return router.createUrlTree(['/app/dashboard']);
};
