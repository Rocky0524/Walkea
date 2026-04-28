import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

interface AdminUsuario {
  id_usuario: number;
  nombre: string;
  email: string;
  reputacion: number;
  rol: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  usuarios: AdminUsuario[] = [];
  cargando = true;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.http.get<AdminUsuario[]>(`${environment.apiUrl}/admin/usuarios`).subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.error = 'No se pudieron cargar los usuarios. Comprueba que tienes permisos de admin.';
        this.cargando = false;
      }
    });
  }
}
