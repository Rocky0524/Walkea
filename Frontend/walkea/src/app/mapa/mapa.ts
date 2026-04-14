import { AfterViewInit, Component } from '@angular/core';
import { MarcadorService } from '../services/marcador.service';
import { TipoMarcadorService } from '../services/tipo-marcador.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css'
})
export class MapaComponent implements AfterViewInit {
  private map: any;
  private marcadoresLayer: L.LayerGroup = L.layerGroup(); // Capa para limpiar pines fácil

  marcadores: any[] = [];
  tiposMarcador: any[] = [];
  colores: string[] = ['#e74c3c', '#f39c12', '#3498db', '#2ecc71', '#9b59b6'];

  // null = mostrar todos. Si tiene número, es el id_tipo_marcador
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

    // Añadimos la capa base donde irán todos los pines, así limpiaremos fácil al filtrar
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
    // 1. Limpiamos pines viejos
    this.marcadoresLayer.clearLayers();

    // 2. Filtramos la data original
    const marcadoresAMostrar = this.filtroActivo 
      ? this.marcadores.filter(m => m.id_tipo_marcador === this.filtroActivo)
      : this.marcadores;

    // 3. Pintamos los pines que tocan
    marcadoresAMostrar.forEach((m) => {
      const idx = this.tiposMarcador.findIndex(t => t.id_tipo_marcador === m.id_tipo_marcador);
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
      this.filtroActivo = null; // Si pulsas en el mismo activo, se desmarca y muestra todos
    } else {
      this.filtroActivo = idTipo;
    }
    this.pintarMarcadores();
  }

  getColor(i: number): string {
    return this.colores[i] || '#999';
  }

  private obtenerUbicacionReal(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          L.marker([lat, lon]).addTo(this.map)
            .bindPopup('<b>¡Estás aquí, Kenneth!</b>');
        },
        (error) => {
          console.error('Error obteniendo la ubicación', error);
        }
      );
    }
  }


}
