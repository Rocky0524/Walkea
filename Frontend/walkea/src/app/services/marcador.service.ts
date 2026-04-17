import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Marcador {
  id_marcador: number;
  id?: number;
  id_usuario?: number;
  id_tipo_marcador: number;
  titulo: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  estado: string;
  vida: number;
  hp_vida?: number;
  created_at?: string;
  updated_at?: string;
  tipo_marcador?: {
    nombre: string;
  };
  usuario?: {
    id_usuario?: number;
    nombre?: string;
    email?: string;
  };
}

export interface RespuestaVoto {
  mensaje: string;
  vida_marcador: number;
  hp_vida: number;
  nivel_usuario: string;
  peso_voto: number;
}

@Injectable({
  providedIn: 'root'
})
export class MarcadorService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // trae todos los marcadores sin filtrar
  obtenerTodos(): Observable<Marcador[]> {
    return this.http.get<Marcador[]>(`${this.apiUrl}/marcador`);
  }

  // trae los marcadores que esten cerca de unas coordenadas, el backend filtra a 5km
  obtenerCercanos(lat: number, lng: number): Observable<Marcador[]> {
    return this.http.get<Marcador[]>(`${this.apiUrl}/marcador?lat=${lat}&lng=${lng}`);
  }

  // envia un nuevo marcador al backend
  crear(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/marcador`, datos);
  }

  votar(idMarcador: number, tipo: 'positivo' | 'negativo'): Observable<RespuestaVoto> {
    return this.http.post<RespuestaVoto>(`${this.apiUrl}/marcador/${idMarcador}/votar`, { tipo });
  }

  eliminar(idMarcador: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/marcador/${idMarcador}`);
  }

  normalizarMarcador(raw: any): Marcador {
    const idMarcador = Number(raw?.id_marcador ?? raw?.id ?? 0);
    const vida = Number(raw?.vida ?? raw?.hp_vida ?? 0);
    const hpVida = Number(raw?.hp_vida ?? raw?.vida ?? 0);

    return {
      id_marcador: idMarcador,
      id: Number(raw?.id ?? idMarcador),
      id_usuario: Number(raw?.id_usuario ?? raw?.usuario?.id_usuario ?? 0) || undefined,
      id_tipo_marcador: Number(raw?.id_tipo_marcador ?? 0),
      titulo: String(raw?.titulo ?? 'Sin titulo'),
      descripcion: String(raw?.descripcion ?? 'Sin descripcion'),
      latitud: Number(raw?.latitud ?? 0),
      longitud: Number(raw?.longitud ?? 0),
      estado: String(raw?.estado ?? 'activo'),
      vida,
      hp_vida: hpVida,
      created_at: raw?.created_at,
      updated_at: raw?.updated_at,
      tipo_marcador: raw?.tipo_marcador ?? raw?.tipoMarcador,
      usuario: raw?.usuario
    };
  }

  normalizarLista(data: any[]): Marcador[] {
    return (data ?? []).map((m) => this.normalizarMarcador(m));
  }
}
