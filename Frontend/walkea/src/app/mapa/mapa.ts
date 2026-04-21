import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
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

  constructor(
    private marcadorService: MarcadorService,
    private tipoMarcadorService: TipoMarcadorService
  ) {}

  ngAfterViewInit(): void {
    this.initMap();
    setTimeout(() => this.map.invalidateSize(), 0);
    this.cargarTipos();
    this.obtenerUbicacionReal();
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
    this.marcadorService.obtenerTodos().subscribe({
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
      const iconoEmoji = this.iconoPorTipo(m.id_tipo_marcador);
      const marker = L.marker([m.latitud, m.longitud], {
        icon: L.divIcon({
          className: 'emoji-marker-wrapper',
          html: `<div style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:22px;border-radius:50%;background:rgba(255,255,255,0.92);box-shadow:0 6px 14px rgba(25,42,68,0.2);">${iconoEmoji}</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        })
      });

      marker.bindPopup(this.crearContenidoPopup(m));
      this.marcadoresLayer.addLayer(marker);
    });
  }

  private iconoPorTipo(idTipo: number): string {
    switch (idTipo) {
      case 1:
        return '👊';
      case 2:
        return '🛠️';
      case 3:
        return '🕒';
      case 4:
        return '‼️';
      default:
        return '📍';
    }
  }

  private crearContenidoPopup(marcador: Marcador): HTMLElement {
    const titulo = this.escapeHtml(marcador.titulo || marcador.tipo_marcador?.nombre || 'Marcador');
    const descripcion = this.escapeHtml(marcador.descripcion || 'Sin descripci\u00f3n');
    const estado = this.escapeHtml(marcador.estado || 'activo');
    const hp = marcador.hp_vida ?? marcador.vida;
    const agotado = hp === 0;
    const contenedor = document.createElement('div');
    contenedor.className = 'popup-voto';
    contenedor.innerHTML = `
      <div class="popup-voto-title">${titulo}</div>
      <p class="popup-voto-description">${descripcion}</p>
      <div class="popup-voto-meta">
        <span class="popup-meta-chip">Estado: ${estado}</span>
        <span class="popup-meta-chip">HP: ${hp}/10</span>
      </div>
      <small class="popup-voto-hint">Vota este reporte desde el mapa</small>
      <div class="popup-actions">
        <button class="vote-btn vote-positive" ${agotado ? 'disabled' : ''}>Sigue ah\u00ed</button>
        <button class="vote-btn vote-negative" ${agotado ? 'disabled' : ''}>Ya no est\u00e1</button>
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
    if (this.votoEnCursoId === marcador.id_marcador) {
      return;
    }

    this.votoEnCursoId = marcador.id_marcador;

    this.marcadorService.votar(marcador.id_marcador, tipo).subscribe({
      next: (respuesta) => {
        this.votoEnCursoId = null;
        alert(`Voto ${tipo} aplicado con peso ${respuesta.peso_voto}.`);
        this.cargarMarcadores();
      },
      error: (err) => {
        this.votoEnCursoId = null;
        const mensaje = err?.error?.mensaje || 'No se pudo registrar el voto.';
        alert(mensaje);
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
        L.marker([lat, lon]).addTo(this.map).bindPopup('<b>Est\u00e1s aqu\u00ed</b>');
      },
      (error) => {
        console.error('Error obteniendo la ubicaci\u00f3n', error);
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
        alert('Reporte guardado correctamente');
        this.cerrarModalReporte();
        this.cargarMarcadores();
      },
      error: (err) => {
        console.error('Error guardando reporte:', err);
        alert('Error al guardar en la BD. Aseg\u00farate de tener token JWT y backend encendido.');
      }
    });
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
