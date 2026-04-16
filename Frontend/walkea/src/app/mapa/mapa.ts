import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import { NuevoReporteComponent } from '../components/nuevo-reporte/nuevo-reporte';
import { MarcadorService } from '../services/marcador.service';
import { TipoMarcadorService } from '../services/tipo-marcador.service';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [NuevoReporteComponent],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css'
})
export class MapaComponent implements AfterViewInit {
  private map: any;
  private marcadoresLayer: L.LayerGroup = L.layerGroup();

  mostrarNuevoReporte: boolean = false;
  marcadores: any[] = [];
  tiposMarcador: any[] = [];
  colores: string[] = ['#e74c3c', '#f39c12', '#3498db', '#2ecc71', '#9b59b6'];

  // null = mostrar todos. Si tiene numero, es el id_tipo_marcador
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
      next: (data) => {
        this.marcadores = data;
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
      const idx = this.tiposMarcador.findIndex((t) => t.id_tipo_marcador === m.id_tipo_marcador);
      const color = this.colores[idx] || '#999';

      const circulo = L.circleMarker([m.latitud, m.longitud], {
        radius: 10,
        fillColor: color,
        color: '#fff',
        weight: 2,
        fillOpacity: 0.9
      });

      const tipoNombre = m.tipo_marcador?.nombre || 'Sin tipo';
      circulo.bindPopup(`
        <b>${tipoNombre}</b><br>
        ${m.descripcion}<br>
        <small>Estado: ${m.estado}</small>
      `);

      this.marcadoresLayer.addLayer(circulo);
    });
  }

  filtrarPorTipo(idTipo: number | null): void {
    if (this.filtroActivo === idTipo) {
      this.filtroActivo = null;
    } else {
      this.filtroActivo = idTipo;
    }
    this.pintarMarcadores();
  }

  getColor(i: number): string {
    return this.colores[i] || '#999';
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
        alert('Reporte guardado correctamente');
        this.cerrarModalReporte();
        this.cargarMarcadores();
      },
      error: (err) => {
        console.error('Error guardando reporte:', err);
        alert('Error al guardar en la BD. Asegurate de tener token JWT y backend encendido.');
      }
    });
  }
}
