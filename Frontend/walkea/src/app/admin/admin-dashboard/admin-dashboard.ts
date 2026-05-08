import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface AdminUsuario {
  id_usuario: number;
  nombre: string;
  email: string;
  reputacion: number;
  rol: string;
}

interface AdminReporte {
  id_marcador: number;
  titulo: string;
  descripcion: string;
  estado: string;
  vida: number;
  created_at: string;
  usuario?: {
    id_usuario: number;
    nombre: string;
    email: string;
  };
  tipo_marcador?: {
    id_tipo_marcador: number;
    nombre: string;
  };
}

interface AuditoriaItem {
  id: number;
  id_marcador_original: number;
  titulo: string;
  estado: string;
  vida: number;
  email_usuario_reportero: string | null;
  created_at: string;
  admin_usuario?: {
    id_usuario: number;
    nombre: string;
    email: string;
  };
}

type AdminTab = 'usuarios' | 'reportes' | 'auditoria';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  tabActual: AdminTab = 'usuarios';
  cargando = true;
  error = '';

  usuarios: AdminUsuario[] = [];
  reportes: AdminReporte[] = [];
  auditoria: AuditoriaItem[] = [];

  busquedaReportes = '';
  filtroEstado: 'todos' | 'activo' | 'agotado' | 'caducado' = 'todos';
  eliminandoId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  get reportesFiltrados(): AdminReporte[] {
    const texto = this.busquedaReportes.trim().toLowerCase();

    return this.reportes.filter((reporte) => {
      const cumpleEstado = this.filtroEstado === 'todos' || reporte.estado === this.filtroEstado;
      if (!cumpleEstado) {
        return false;
      }

      if (!texto) {
        return true;
      }

      const titulo = String(reporte.titulo ?? '').toLowerCase();
      const descripcion = String(reporte.descripcion ?? '').toLowerCase();
      const email = String(reporte.usuario?.email ?? '').toLowerCase();
      const tipo = String(reporte.tipo_marcador?.nombre ?? '').toLowerCase();

      return titulo.includes(texto) || descripcion.includes(texto) || email.includes(texto) || tipo.includes(texto);
    });
  }

  cambiarTab(tab: AdminTab): void {
    this.tabActual = tab;
  }

  cargarTodo(): void {
    this.cargando = true;
    this.error = '';

    this.http.get<AdminUsuario[]>(`${environment.apiUrl}/admin/usuarios`).subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cargarReportes();
      },
      error: () => {
        this.error = 'No se pudo cargar el panel admin.';
        this.cargando = false;
      }
    });
  }

  cargarReportes(): void {
    this.http.get<AdminReporte[]>(`${environment.apiUrl}/admin/reportes`).subscribe({
      next: (reportes) => {
        this.reportes = reportes;
        this.cargarAuditoria();
      },
      error: () => {
        this.error = 'No se pudieron cargar los reportes para moderacion.';
        this.cargando = false;
      }
    });
  }

  cargarAuditoria(): void {
    this.http.get<AuditoriaItem[]>(`${environment.apiUrl}/admin/reportes-auditoria`).subscribe({
      next: (auditoria) => {
        this.auditoria = auditoria;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la auditoria de admin.';
        this.cargando = false;
      }
    });
  }

  eliminarReporte(reporte: AdminReporte): void {
    const confirmado = confirm(`Vas a eliminar el reporte "${reporte.titulo || 'Sin titulo'}". Esta accion no se puede deshacer.`);
    if (!confirmado) {
      return;
    }

    this.eliminandoId = reporte.id_marcador;
    this.error = '';

    this.http.delete<{ mensaje: string }>(`${environment.apiUrl}/admin/reportes/${reporte.id_marcador}`).subscribe({
      next: () => {
        this.eliminandoId = null;
        this.reportes = this.reportes.filter((item) => item.id_marcador !== reporte.id_marcador);
        this.cargarAuditoria();
      },
      error: () => {
        this.eliminandoId = null;
        this.error = 'No se pudo eliminar el reporte.';
      }
    });
  }
}
