import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth';

export interface Notificacion {
  id: string;
  texto: string;
  fecha: string;
  leida: boolean;
  marcadorId: number | null;
  tipo: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private readonly apiUrl = environment.apiUrl;
  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);

  readonly notificaciones$ = this.notificacionesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  actualizarDesdeBackend(): void {
    if (!this.authService.isAuthenticated()) {
      this.notificacionesSubject.next([]);
      return;
    }

    this.http.get<Notificacion[]>(`${this.apiUrl}/notificaciones`).pipe(
      catchError(() => of([]))
    ).subscribe((items) => {
      this.notificacionesSubject.next(items ?? []);
    });
  }

  marcarTodasComoLeidas(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.http.post(`${this.apiUrl}/notificaciones/marcar-leidas`, {}).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      const actualizadas = this.notificacionesSubject.value.map((item) => ({
        ...item,
        leida: true,
      }));

      this.notificacionesSubject.next(actualizadas);
    });
  }

  vaciar(): void {
    if (!this.authService.isAuthenticated()) {
      this.notificacionesSubject.next([]);
      return;
    }

    this.http.delete(`${this.apiUrl}/notificaciones`).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.notificacionesSubject.next([]);
    });
  }
}
