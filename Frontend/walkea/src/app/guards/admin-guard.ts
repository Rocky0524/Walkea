import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { PerfilService } from '../services/perfil.service';
import { resolveAppRole } from '../utils/role.util';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const perfilService = inject(PerfilService);

  return perfilService.obtenerPerfil().pipe(
    map(({ usuario }) => {
      const resolvedRole = resolveAppRole(usuario);
      localStorage.setItem('rol', resolvedRole);
      localStorage.setItem('email', String(usuario?.email ?? '').trim().toLowerCase());

      return resolvedRole === 'admin' ? true : router.createUrlTree(['/app/dashboard']);
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
