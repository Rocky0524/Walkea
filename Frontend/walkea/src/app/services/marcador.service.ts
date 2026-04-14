import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Marcador {
  id_marcador: number;
  id_tipo_marcador: number;
  descripcion: string;
  latitud: number;
  longitud: number;
  estado: string;
  vida: number;
  hp_vida?: number;
  tipo_marcador?: {
    nombre: string;
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
}
