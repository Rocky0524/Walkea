import { Component, OnInit } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Marcador, MarcadorService } from '../services/marcador.service';
import { TipoMarcadorService } from '../services/tipo-marcador.service';
import * as L from 'leaflet';
import { NuevoReporteComponent } from '../components/nuevo-reporte/nuevo-reporte';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NuevoReporteComponent, SlicePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private mapa: any;
  private marcadoresEnMapa: any[] = [];
  mostrarNuevoReporte: boolean = false;

  marcadores: Marcador[] = [];
  tiposMarcador: any[] = [];

  constructor(
    private marcadorService: MarcadorService,
    private tipoMarcadorService: TipoMarcadorService
  ) {}

  ngOnInit(): void {
    this.inicializarMapa();
    this.cargarTipos();
    this.pedirUbicacion();
  }

  private inicializarMapa(): void {
    this.mapa = L.map('mapa-dashboard').setView([41.6167, 0.6222], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.mapa);
  }

  private pedirUbicacion(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          this.mapa.setView([lat, lng], 15);

          L.marker([lat, lng]).addTo(this.mapa)
            .bindPopup('<b>Estas aqui</b>')
            .openPopup();

          this.cargarCercanos(lat, lng);
        },
        () => this.cargarTodos()
      );
    } else {
      this.cargarTodos();
    }
  }

  private cargarCercanos(lat: number, lng: number): void {
    this.marcadorService.obtenerCercanos(lat, lng).subscribe({
      next: (dataRaw) => {
        this.marcadores = this.ordenarMarcadoresRecientes(this.marcadorService.normalizarLista(dataRaw));
        this.pintarMarcadores();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  private cargarTodos(): void {
    this.marcadorService.obtenerTodos().subscribe({
      next: (dataRaw) => {
        this.marcadores = this.ordenarMarcadoresRecientes(this.marcadorService.normalizarLista(dataRaw));
        this.pintarMarcadores();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  private cargarTipos(): void {
    this.tipoMarcadorService.obtenerTodos().subscribe({
      next: (data) => {
        this.tiposMarcador = data;
      },
      error: (err) => console.error('Error:', err)
    });
  }

  private pintarMarcadores(): void {
    this.marcadoresEnMapa.forEach((m) => this.mapa.removeLayer(m));
    this.marcadoresEnMapa = [];

    this.marcadores.forEach((m) => {
      const marker = L.marker([m.latitud, m.longitud], {
        icon: L.divIcon({
          className: 'emoji-marker-wrapper',
          html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:20px;border-radius:50%;background:rgba(255,255,255,0.92);box-shadow:0 4px 12px rgba(19,41,66,0.2);">${this.iconoPorTipo(m.id_tipo_marcador)}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      }).addTo(this.mapa);

      const titulo = m.titulo || m.tipo_marcador?.nombre || 'Marcador';
      marker.bindPopup(`
        <b>${titulo}</b><br>
        ${m.descripcion}<br>
        <small>Estado: ${m.estado}</small>
      `);

      this.marcadoresEnMapa.push(marker);
    });
  }

  private ordenarMarcadoresRecientes(marcadores: Marcador[]): Marcador[] {
    return [...marcadores].sort((a, b) => b.id_marcador - a.id_marcador);
  }

  iconoPorTipo(idTipo: number): string {
    switch (idTipo) {
      case 1: return '👊';
      case 2: return '🛠️';
      case 3: return '🕒';
      case 4: return '‼️';
      default: return '📍';
    }
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
        this.pedirUbicacion();
      },
      error: (err) => {
        console.error('Error guardando reporte:', err);
        alert('Error al guardar en la BD. Asegurate de tener token JWT y backend encendido.');
      }
    });
  }
}
