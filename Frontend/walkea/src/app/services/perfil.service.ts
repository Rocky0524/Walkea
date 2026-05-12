import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioPerfil {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface EstadisticasPerfil {
  total_reportes: number;
  total_votos: number;
  nivel: string;
  peso_voto: number;
}

export interface PerfilResponse {
  usuario: UsuarioPerfil;
  estadisticas: EstadisticasPerfil;
}

export interface AjustesPayload {
  nombre?: string;
  email?: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export interface PreferenciasAjustes {
  geolocalizacion: boolean;
  modoOscuro: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private apiUrl = environment.apiUrl;
  private preferenciasKey = 'walkea_preferencias';

  constructor(private http: HttpClient) {}

  obtenerPerfil(): Observable<PerfilResponse> {
    return this.http.get<PerfilResponse>(`${this.apiUrl}/perfil`);
  }

  actualizarAjustes(payload: AjustesPayload): Observable<{ mensaje: string; usuario: UsuarioPerfil }> {
    return this.http.put<{ mensaje: string; usuario: UsuarioPerfil }>(`${this.apiUrl}/ajustes`, payload);
  }

  obtenerPreferencias(): PreferenciasAjustes {
    const guardadas = localStorage.getItem(this.preferenciasKey);

    if (!guardadas) {
      return {
        geolocalizacion: true,
        modoOscuro: false
      };
    }

    try {
      return JSON.parse(guardadas) as PreferenciasAjustes;
    } catch {
      return {
        geolocalizacion: true,
        modoOscuro: false
      };
    }
  }

  guardarPreferencias(preferencias: PreferenciasAjustes): void {
    localStorage.setItem(this.preferenciasKey, JSON.stringify(preferencias));
  }
}
