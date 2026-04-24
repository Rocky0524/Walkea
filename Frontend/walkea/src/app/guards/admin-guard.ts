import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { PerfilService } from '../services/perfil.service';
import { resolveAppRole } from '../utils/role.util';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const perfilService = inject(PerfilService);
  const rol = String(localStorage.getItem('rol') ?? '').trim().toLowerCase();
  const email = String(localStorage.getItem('email') ?? '').trim().toLowerCase();

  if (rol === 'admin' || rol === 'administrador' || email === 'admin@walkea.com') {
    return true;
  }

  // Fallback robusto: si localStorage está desactualizado, validamos contra backend.
  return perfilService.obtenerPerfil().pipe(
    map(({ usuario }) => {
      const resolvedRole = resolveAppRole(usuario);
      localStorage.setItem('rol', resolvedRole);
      localStorage.setItem('email', String(usuario?.email ?? '').trim().toLowerCase());
      return resolvedRole === 'admin' ? true : router.createUrlTree(['/app/dashboard']);
    }),
    catchError(() => of(router.createUrlTree(['/app/dashboard'])))
  );
};
