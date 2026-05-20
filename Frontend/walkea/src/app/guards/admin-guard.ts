import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { PerfilService } from '../services/perfil.service';
import { resolveAppRole } from '../utils/role.util';

// SEGURIDAD: Usamos la nueva sintaxis de Guards Funcionales (CanActivateFn) de Angular.
// Es más limpio y moderno que usar clases. Inyectamos servicios con inject().
export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const perfilService = inject(PerfilService);

  // Llamada reactiva (RxJS) al backend para confirmar el rol de forma segura en tiempo real.
  return perfilService.obtenerPerfil().pipe(
    map(({ usuario }) => {
      const resolvedRole = resolveAppRole(usuario);
      localStorage.setItem('rol', resolvedRole);
      localStorage.setItem('email', String(usuario?.email ?? '').trim().toLowerCase());

      // Retornamos true si pasa, o un UrlTree seguro si falla (para interceptar la navegación limpiamente)
      return resolvedRole === 'admin' ? true : router.createUrlTree(['/app/dashboard']);
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
