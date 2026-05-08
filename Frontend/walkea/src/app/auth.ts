import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  registro(datosUsuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, datosUsuario);
  }

  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales);
  }

  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  logoutRequest(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isGuestMode(): boolean {
    return localStorage.getItem('modo') === 'invitado';
  }

  startGuestMode(): void {
    localStorage.removeItem('token');
    localStorage.setItem('modo', 'invitado');
    localStorage.setItem('rol', 'invitado');
    localStorage.removeItem('email');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('email');
    localStorage.removeItem('modo');
  }
}
