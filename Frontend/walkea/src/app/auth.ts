import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Esta es la URL base del backend de. 
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  // Función para registrarse
  registro(datosUsuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, datosUsuario);
  }

  // Función para iniciar sesión
  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales);
  }
}