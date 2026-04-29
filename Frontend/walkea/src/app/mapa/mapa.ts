import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import { AuthService } from '../auth';
import { NuevoReporteComponent } from '../components/nuevo-reporte/nuevo-reporte';
import { Marcador, MarcadorService } from '../services/marcador.service';
import { TipoMarcadorService } from '../services/tipo-marcador.service';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [NuevoReporteComponent],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css'
})
export class MapaComponent implements AfterViewInit {
  private map!: L.Map;
  private marcadoresLayer: L.LayerGroup = L.layerGroup();
  private votoEnCursoId: number | null = null;

  mostrarNuevoReporte = false;
  marcadores: Marcador[] = [];
  tiposMarcador: any[] = [];
  filtroActivo: number | null = null;
  currentUserId: number | null = null;
  mensaje = '';
  error = '';

  constructor(
    private authService: AuthService,
    private marcadorService: MarcadorService,
    private tipoMarcadorService: TipoMarcadorService
  ) { }

  ngAfterViewInit(): void {
    this.initMap();
    setTimeout(() => this.map.invalidateSize(), 0);
    this.cargarUsuarioActual();
  }

  private cargarUsuarioActual(): void {
    this.authService.me().subscribe({
      next: (usuario) => {
        this.currentUserId = Number(usuario?.id_usuario ?? usuario?.id ?? 0) || null;
        this.cargarTipos();
        this.obtenerUbicacionReal();
      },
      error: () => {
        this.currentUserId = null;
        this.cargarTipos();
        this.obtenerUbicacionReal();
      }
    });
  }

  private initMap(): void {
    this.map = L.map('map').setView([41.6167, 0.6222], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 3,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    this.marcadoresLayer.addTo(this.map);
  }

  private cargarTipos(): void {
    this.tipoMarcadorService.obtenerTodos().subscribe({
      next: (data) => {
        this.tiposMarcador = data;
        this.cargarMarcadores();
      },
      error: (err) => console.error('Error cargando tipos de marcador:', err)
    });
  }

  private cargarMarcadores(): void {
    this.marcadorService.obtenerTodos(true).subscribe({
      next: (dataRaw) => {
        this.marcadores = this.marcadorService.normalizarLista(dataRaw);
        this.pintarMarcadores();
      },
      error: (err) => console.error('Error cargando marcadores:', err)
    });
  }

  private pintarMarcadores(): void {
    this.marcadoresLayer.clearLayers();

    const marcadoresAMostrar = this.filtroActivo
      ? this.marcadores.filter((m) => m.id_tipo_marcador === this.filtroActivo)
      : this.marcadores;

    marcadoresAMostrar.forEach((m) => {
      const color = this.colorPorTipo(m.id_tipo_marcador);
      const marker = L.marker([m.latitud, m.longitud], {
        icon: L.divIcon({
          className: 'emoji-marker-wrapper',
          html: `<div style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:20px;border-radius:50%;background:${color};color:white;box-shadow:0 6px 14px rgba(25,42,68,0.25);border:2.5px solid white;">${this.iconoPorTipo(m.id_tipo_marcador)}</div>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        })
      });

      marker.bindPopup(this.crearContenidoPopup(m));
      this.marcadoresLayer.addLayer(marker);
    });
  }

  private iconoPorTipo(idTipo: number): string {
    switch (idTipo) {
      case 1:
        return '⚠️';
      case 2:
        return '🔧';
      case 3:
        return '✅';
      case 4:
        return '❗';
      default:
        return '📍';
    }
  }

  private colorPorTipo(idTipo: number): string {
    switch (idTipo) {
      case 1:
        return '#ef4444';
      case 2:
        return '#f59e0b';
      case 3:
        return '#22c55e';
      case 4:
        return '#8b5cf6';
      default:
        return '#2b74c8';
    }
  }

  private crearContenidoPopup(marcador: Marcador): HTMLElement {
    const titulo = this.escapeHtml(marcador.titulo || marcador.tipo_marcador?.nombre || 'Marcador');
    const descripcion = this.escapeHtml(marcador.descripcion || 'Sin descripcion');
    const estado = this.escapeHtml(marcador.estado || 'activo');
    const hp = marcador.hp_vida ?? marcador.vida;
    const bloqueado = this.estaBloqueado(marcador);
    const mensajeBloqueo = this.mensajeBloqueoVoto(marcador);

    const contenedor = document.createElement('div');
    contenedor.className = 'popup-voto';
    contenedor.innerHTML = `
      <div class="popup-voto-title">${titulo}</div>
      <p class="popup-voto-description">${descripcion}</p>
      <div class="popup-voto-meta">
        <span class="popup-meta-chip">Estado: ${estado}</span>
        <span class="popup-meta-chip">HP: ${hp}/10</span>
      </div>
      <small class="popup-voto-hint">${this.escapeHtml(mensajeBloqueo || 'Vota este reporte desde el mapa')}</small>
      <div class="popup-actions">
        <button class="vote-btn vote-positive" ${bloqueado ? 'disabled' : ''}>Sigue ahi</button>
        <button class="vote-btn vote-negative" ${bloqueado ? 'disabled' : ''}>Ya no esta</button>
      </div>
    `;

    const btnPos = contenedor.querySelector('.vote-positive') as HTMLButtonElement | null;
    const btnNeg = contenedor.querySelector('.vote-negative') as HTMLButtonElement | null;

    if (btnPos) {
      btnPos.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.votarDesdeMapa(marcador, 'positivo');
      });
    }

    if (btnNeg) {
      btnNeg.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.votarDesdeMapa(marcador, 'negativo');
      });
    }

    return contenedor;
  }

  private votarDesdeMapa(marcador: Marcador, tipo: 'positivo' | 'negativo'): void {
    if (this.estaBloqueado(marcador)) {
      this.error = this.mensajeBloqueoVoto(marcador);
      this.mensaje = '';
      return;
    }

    if (this.votoEnCursoId === marcador.id_marcador) {
      return;
    }

    this.votoEnCursoId = marcador.id_marcador;
    this.error = '';
    this.mensaje = '';

    this.marcadorService.votar(marcador.id_marcador, tipo).subscribe({
      next: (respuesta) => {
        this.votoEnCursoId = null;
        this.mensaje = respuesta.hp_vida === 0
          ? 'Tu voto se ha registrado y el reporte ha quedado agotado.'
          : `Voto ${tipo} aplicado con peso ${respuesta.peso_voto}.`;
        this.cargarMarcadores();
      },
      error: (err) => {
        this.votoEnCursoId = null;
        this.error = this.obtenerMensajeErrorVoto(err);
        this.cargarMarcadores();
      }
    });
  }

  filtrarPorTipo(idTipo: number | null): void {
    this.filtroActivo = this.filtroActivo === idTipo ? null : idTipo;
    this.pintarMarcadores();
  }

  private obtenerUbicacionReal(): void {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        L.marker([lat, lon]).addTo(this.map).bindPopup('<b>Estas aqui</b>');
      },
      (error) => {
        console.error('Error obteniendo la ubicacion', error);
      }
    );
  }

  abrirModalReporte(): void {
    this.mostrarNuevoReporte = true;
  }

  cerrarModalReporte(): void {
    this.mostrarNuevoReporte = false;
  }

  guardarReporte(datos: any): void {
    this.marcadorService.crear(datos).subscribe({
      next: () => {
        this.mensaje = 'Reporte guardado correctamente.';
        this.error = '';
        this.cerrarModalReporte();
        this.cargarMarcadores();
      },
      error: (err) => {
        console.error('Error guardando reporte:', err);
        this.error = 'Error al guardar en la BD. Asegurate de tener token JWT y backend encendido.';
        this.mensaje = '';
      }
    });
  }

  esPropio(marcador: Marcador): boolean {
    const autorId = Number(marcador.id_usuario ?? marcador.usuario?.id_usuario ?? 0);
    return !!this.currentUserId && autorId === this.currentUserId;
  }

  estaBloqueado(marcador: Marcador): boolean {
    return this.esPropio(marcador) || this.esInactivo(marcador);
  }

  private esInactivo(marcador: Marcador): boolean {
    const hp = Number(marcador.hp_vida ?? marcador.vida ?? 0);
    return hp === 0 || marcador.estado === 'agotado' || marcador.estado === 'caducado';
  }

  private mensajeBloqueoVoto(marcador: Marcador): string {
    if (this.esPropio(marcador)) {
      return 'No puedes votar tu propio reporte.';
    }

    if (marcador.estado === 'caducado') {
      return 'Este reporte ha caducado por no recibir votos a tiempo.';
    }

    if (this.esInactivo(marcador)) {
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

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
