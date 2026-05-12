import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from './services/toast.service';

// interceptor que mete el token JWT en todas las peticiones automaticamente
// asi no tenemos que ponerlo a mano cada vez en cada servicio
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);
  const token = localStorage.getItem('token');
  const ejecutarPeticion = token
    ? next(req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      }))
    : next(req);

  return ejecutarPeticion.pipe(
    catchError((error) => {
      const mensaje = String(error?.error?.mensaje ?? '').toLowerCase();

      if (error?.status === 403 && mensaje.includes('inhabilitada')) {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        localStorage.removeItem('email');
        localStorage.removeItem('modo');
        toastService.error('Tu cuenta esta inhabilitada. Contacta con un administrador.');
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
