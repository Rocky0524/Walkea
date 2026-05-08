import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth';
import { Marcador, MarcadorService } from '../../services/marcador.service';

@Component({
  selector: 'app-mis-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-reportes.html',
  styleUrl: './mis-reportes.css',
})
export class MisReportes implements OnInit {
  misReportes: Marcador[] = [];
  cargando = true;
  error = '';
  eliminandoId: number | null = null;

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
              .filter((m) => Number(m.id_usuario ?? m.usuario?.id_usuario ?? 0) === idUsuario)
              .sort((a, b) => b.id_marcador - a.id_marcador);
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
}
