import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PerfilResponse {
  usuario: {
    id_usuario: number;
    nombre: string;
    email: string;
    reputacion: number;
  };
  estadisticas: {
    total_reportes: number;
    total_votos: number;
    nivel: string;
    peso_voto: number;
  };
}

export interface AjustesPayload {
  nombre?: string;
  email?: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerPerfil(): Observable<PerfilResponse> {
    return this.http.get<PerfilResponse>(`${this.apiUrl}/perfil`);
  }

  actualizarAjustes(payload: AjustesPayload): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.apiUrl}/ajustes`, payload);
  }
}
