import { HttpInterceptorFn } from '@angular/common/http';

// interceptor que mete el token JWT en todas las peticiones automaticamente
// asi no tenemos que ponerlo a mano cada vez en cada servicio
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    const peticionConToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(peticionConToken);
  }

  return next(req);
};
