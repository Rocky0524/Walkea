import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth';
import { Marcador, MarcadorService } from '../services/marcador.service';
import { TiempoRelativoPipe } from '../utils/tiempo-relativo.pipe';

@Component({
  selector: 'app-reportes-votos',
  standalone: true,
  imports: [CommonModule, TiempoRelativoPipe],
  templateUrl: './reportes-votos.html',
  styleUrl: './reportes-votos.css'
})
export class ReportesVotosComponent implements OnInit {
  reportes: Marcador[] = [];
  cargando = true;
  votoEnCursoId: number | null = null;
  mensaje = '';
  error = '';
  currentUserId: number | null = null;

  constructor(
    private marcadorService: MarcadorService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (usuario) => {
        this.currentUserId = Number(usuario?.id_usuario ?? usuario?.id ?? 0) || null;
        this.cargarReportes();
      },
      error: () => {
        this.error = 'Tu sesion no es valida. Inicia sesion de nuevo.';
        this.cargando = false;
      }
    });
  }

  cargarReportes(): void {
    this.cargando = true;
    this.error = '';

    this.marcadorService.obtenerTodos().subscribe({
      next: (data) => {
        this.reportes = this.marcadorService.normalizarLista(data);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los reportes.';
        this.cargando = false;
      }
    });
  }

  votar(reporte: Marcador, tipo: 'positivo' | 'negativo'): void {
    if (!this.puedeVotar(reporte)) {
      this.error = this.mensajeBloqueoVoto(reporte);
      this.mensaje = '';
      return;
    }

    this.votoEnCursoId = reporte.id_marcador;
    this.mensaje = '';
    this.error = '';

    this.marcadorService.votar(reporte.id_marcador, tipo).subscribe({
      next: (respuesta) => {
        reporte.vida = respuesta.vida_marcador;
        reporte.hp_vida = respuesta.hp_vida;
        if (respuesta.hp_vida === 0) {
          reporte.estado = 'agotado';
        }
        this.mensaje = respuesta.hp_vida === 0
          ? 'Tu voto se ha registrado y el reporte ha quedado agotado.'
          : `Voto ${tipo} aplicado con peso ${respuesta.peso_voto}.`;
        this.votoEnCursoId = null;
      },
      error: (err) => {
        this.error = this.obtenerMensajeErrorVoto(err);
        this.votoEnCursoId = null;
        this.cargarReportes();
      }
    });
  }

  textoUbicacion(reporte: Marcador): string {
    return `${Number(reporte.latitud).toFixed(3)}, ${Number(reporte.longitud).toFixed(3)}`;
  }

  vidaVisible(reporte: Marcador): number {
    return Number(reporte.hp_vida ?? reporte.vida ?? 0);
  }

  esPropio(reporte: Marcador): boolean {
    const autorId = Number(reporte.id_usuario ?? reporte.usuario?.id_usuario ?? 0);
    return !!this.currentUserId && autorId > 0 && autorId === this.currentUserId;
  }

  private esInactivo(reporte: Marcador): boolean {
    return this.vidaVisible(reporte) === 0 || reporte.estado === 'agotado' || reporte.estado === 'caducado';
  }

  puedeVotar(reporte: Marcador): boolean {
    return !this.esPropio(reporte) && !this.esInactivo(reporte);
  }

  mensajeBloqueoVoto(reporte: Marcador): string {
    if (this.esPropio(reporte)) {
      return 'No puedes votar tu propio reporte.';
    }

    if (reporte.estado === 'caducado') {
      return 'Este reporte ha caducado por no recibir votos en 24 horas.';
    }

    if (this.esInactivo(reporte)) {
      return 'Este reporte ya esta agotado y no admite mas votos.';
    }

    return '';
  }

  private obtenerMensajeErrorVoto(err: any): string {
    const mensaje = String(err?.error?.mensaje ?? '');

    if (mensaje) {
      return mensaje;
    }

    if (err?.status === 403) {
      return 'No puedes votar tu propio reporte.';
    }

    if (err?.status === 409) {
      return 'Este reporte ya no admite mas votos.';
    }

    return 'No se pudo registrar el voto.';
  }
}
