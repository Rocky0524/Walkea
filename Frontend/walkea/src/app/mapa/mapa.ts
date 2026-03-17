import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MarcadorService } from '../services/marcador.service';
import { TipoMarcadorService } from '../services/tipo-marcador.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css'
})
export class MapaComponent implements OnInit {
  private map: any;

  marcadores: any[] = [];
  tiposMarcador: any[] = [];

  // agrupamos los circulos por tipo para poder mostrar/ocultar
  capaPorTipo: { [id: number]: any[] } = {};
  filtrosActivos: { [id: number]: boolean } = {};

  colores: string[] = ['#e74c3c', '#f39c12', '#3498db', '#2ecc71', '#9b59b6'];

  constructor(
    private marcadorService: MarcadorService,
    private tipoMarcadorService: TipoMarcadorService
  ) {}

  ngOnInit(): void {
    this.initMap();
    this.obtenerUbicacionReal();
    this.cargarTipos();
    this.cargarMarcadores();
  }

  private initMap(): void {
    this.map = L.map('map').setView([41.6167, 0.6222], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 3,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);
  }

  private obtenerUbicacionReal(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.map.setView([lat, lon], 16);

          L.marker([lat, lon]).addTo(this.map)
            .bindPopup('<b>Estás aquí</b>')
            .openPopup();
        },
        (error) => {
          console.error('Error obteniendo la ubicación', error);
        }
      );
    }
  }

  private cargarTipos(): void {
    this.tipoMarcadorService.obtenerTodos().subscribe({
      next: (data) => {
        this.tiposMarcador = data;
        // al principio todos los filtros estan activos
        data.forEach((tipo: any) => {
          this.filtrosActivos[tipo.id_tipo_marcador] = true;
        });
      },
      error: (err) => console.error('Error cargando tipos:', err)
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
    this.marcadores.forEach((m) => {
      const idTipo = m.id_tipo_marcador;
      const idx = this.tiposMarcador.findIndex(t => t.id_tipo_marcador === idTipo);
      const color = this.colores[idx] || '#999';

      const circulo = L.circleMarker([m.latitud, m.longitud], {
        radius: 10,
        fillColor: color,
        color: '#fff',
        weight: 2,
        fillOpacity: 0.9
      }).addTo(this.map);

      const tipoNombre = m.tipo_marcador?.nombre || 'Sin tipo';
      circulo.bindPopup(`
        <b>${tipoNombre}</b><br>
        ${m.descripcion}<br>
        <small>Estado: ${m.estado}</small>
      `);

      // guardamos el circulo agrupado por tipo
      if (!this.capaPorTipo[idTipo]) {
        this.capaPorTipo[idTipo] = [];
      }
      this.capaPorTipo[idTipo].push(circulo);
    });
  }

  // cuando el usuario pulsa un chip, mostramos u ocultamos esos marcadores
  toggleFiltro(idTipo: number): void {
    this.filtrosActivos[idTipo] = !this.filtrosActivos[idTipo];
    const circulos = this.capaPorTipo[idTipo] || [];

    if (this.filtrosActivos[idTipo]) {
      circulos.forEach(c => c.addTo(this.map));
    } else {
      circulos.forEach(c => this.map.removeLayer(c));
    }
  }

  getColor(i: number): string {
    return this.colores[i] || '#999';
  }
}