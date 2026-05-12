import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth';
import { Marcador, MarcadorService } from '../../services/marcador.service';

type OrdenMisReportes = 'recientes' | 'antiguos' | 'vida_desc' | 'estado';

@Component({
  selector: 'app-mis-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-reportes.html',
  styleUrl: './mis-reportes.css',
})
export class MisReportes implements OnInit {
  misReportes: Marcador[] = [];
  cargando = true;
  error = '';
  eliminandoId: number | null = null;
  ordenActual: OrdenMisReportes = 'recientes';

  constructor(
    private marcadorService: MarcadorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarMisReportes();
  }

  cargarMisReportes(): void {
    this.cargando = true;
    this.error = '';

    this.authService.me().subscribe({
      next: (usuario) => {
        const idUsuario = Number(usuario?.id_usuario ?? usuario?.id ?? 0);
        if (!idUsuario) {
          this.error = 'No se pudo identificar tu usuario.';
          this.cargando = false;
          return;
        }

        this.marcadorService.obtenerTodos().subscribe({
          next: (marcadoresRaw) => {
            const marcadores = this.marcadorService.normalizarLista(marcadoresRaw);
            this.misReportes = marcadores
              .filter((m) => Number(m.id_usuario ?? m.usuario?.id_usuario ?? 0) === idUsuario);
            this.cargando = false;
          },
          error: () => {
            this.error = 'No se pudieron cargar tus reportes.';
            this.cargando = false;
          }
        });
      },
      error: () => {
        this.error = 'Sesi\u00f3n no v\u00e1lida. Inicia sesi\u00f3n de nuevo.';
        this.cargando = false;
      }
    });
  }

  textoUbicacion(reporte: Marcador): string {
    const lat = Number(reporte.latitud);
    const lng = Number(reporte.longitud);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
      return 'No disponible';
    }

    return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  }

  vidaVisible(reporte: Marcador): number {
    return Number(reporte.hp_vida ?? reporte.vida ?? 0);
  }

  get misReportesOrdenados(): Marcador[] {
    const lista = [...this.misReportes];

    switch (this.ordenActual) {
      case 'antiguos':
        return lista.sort((a, b) => this.valorFecha(a) - this.valorFecha(b));
      case 'vida_desc':
        return lista.sort((a, b) => {
          const diferenciaVida = this.vidaVisible(b) - this.vidaVisible(a);
          return diferenciaVida !== 0 ? diferenciaVida : this.valorFecha(b) - this.valorFecha(a);
        });
      case 'estado':
        return lista.sort((a, b) => {
          const diferenciaEstado = this.prioridadEstado(a.estado) - this.prioridadEstado(b.estado);
          return diferenciaEstado !== 0 ? diferenciaEstado : this.valorFecha(b) - this.valorFecha(a);
        });
      default:
        return lista.sort((a, b) => this.valorFecha(b) - this.valorFecha(a));
    }
  }

  eliminarReporte(reporte: Marcador): void {
    const confirmado = confirm(`¿Seguro que quieres eliminar "${reporte.titulo || 'Sin título'}"? Esta acción no se puede deshacer.`);
    if (!confirmado) {
      return;
    }

    this.eliminandoId = reporte.id_marcador;
    this.error = '';

    this.marcadorService.eliminar(reporte.id_marcador).subscribe({
      next: () => {
        this.misReportes = this.misReportes.filter((r) => r.id_marcador !== reporte.id_marcador);
        this.eliminandoId = null;
      },
      error: () => {
        this.error = 'No se pudo eliminar el reporte.';
        this.eliminandoId = null;
      }
    });
  }

  private valorFecha(reporte: Marcador): number {
    const fecha = reporte.created_at ? new Date(reporte.created_at).getTime() : NaN;
    return Number.isFinite(fecha) ? fecha : reporte.id_marcador;
  }

  private prioridadEstado(estado: string | null | undefined): number {
    switch (String(estado ?? '').toLowerCase()) {
      case 'activo':
        return 0;
      case 'agotado':
        return 1;
      case 'caducado':
        return 2;
      default:
        return 3;
    }
  }
}
