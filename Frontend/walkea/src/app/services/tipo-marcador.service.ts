import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoMarcadorService {

  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  // trae todos los tipos de marcador que hay en la base de datos
  obtenerTodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipo-marcador`);
  }
}
