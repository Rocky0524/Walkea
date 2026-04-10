import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoMarcadorService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // trae todos los tipos de marcador que hay en la base de datos
  obtenerTodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipo-marcador`);
  }
}
