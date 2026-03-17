import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarcadorService {

  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  // trae todos los marcadores sin filtrar
  obtenerTodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/marcador`);
  }

  // trae los marcadores que esten cerca de unas coordenadas, el backend filtra a 5km
  obtenerCercanos(lat: number, lng: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/marcador?lat=${lat}&lng=${lng}`);
  }

  // envia un nuevo marcador al backend
  crear(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/marcador`, datos);
  }
}
