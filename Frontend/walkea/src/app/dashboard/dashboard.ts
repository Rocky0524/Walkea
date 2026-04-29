import { Component, OnInit } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { NuevoReporteComponent } from '../components/nuevo-reporte/nuevo-reporte';
import { Marcador, MarcadorService } from '../services/marcador.service';
import { TipoMarcadorService } from '../services/tipo-marcador.service';
import { ToastService } from '../services/toast.service';
import { TiempoRelativoPipe } from '../utils/tiempo-relativo.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NuevoReporteComponent, SlicePipe, TiempoRelativoPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private mapa: L.Map | null = null;
  private marcadoresEnMapa: L.Marker[] = [];

  mostrarNuevoReporte = false;
  marcadores: Marcador[] = [];
  tiposMarcador: any[] = [];

  constructor(
    private marcadorService: MarcadorService,
    private tipoMarcadorService: TipoMarcadorService,
    private toastService: ToastService
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
    if (!navigator.geolocation || !this.mapa) {
      this.cargarTodos();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!this.mapa) {
          return;
        }

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.mapa.setView([lat, lng], 15);

        L.marker([lat, lng])
          .addTo(this.mapa)
          .bindPopup('<b>Estas aqui</b>')
          .openPopup();

        this.cargarCercanos(lat, lng);
      },
      () => this.cargarTodos()
    );
  }

  private cargarCercanos(lat: number, lng: number): void {
    this.marcadorService.obtenerCercanos(lat, lng, true).subscribe({
      next: (dataRaw) => {
        this.marcadores = this.ordenarMarcadoresRecientes(this.marcadorService.normalizarLista(dataRaw));
        this.pintarMarcadores();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  private cargarTodos(): void {
    this.marcadorService.obtenerTodos(true).subscribe({
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
    if (!this.mapa) {
      return;
    }

    const mapa = this.mapa;

    this.marcadoresEnMapa.forEach((marker) => mapa.removeLayer(marker));
    this.marcadoresEnMapa = [];

    this.marcadores.forEach((m) => {
      const color = this.colorPorTipo(m.id_tipo_marcador);
      const marker = L.marker([m.latitud, m.longitud], {
        icon: L.divIcon({
          className: 'emoji-marker-wrapper',
          html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:18px;border-radius:50%;background:${color};color:white;box-shadow:0 4px 12px rgba(19,41,66,0.2);border:2px solid white;">${this.iconoPorTipo(m.id_tipo_marcador)}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      }).addTo(mapa);

      const titulo = m.titulo || m.tipo_marcador?.nombre || 'Marcador';
      const descripcion = m.descripcion || 'Sin descripcion';
      marker.bindPopup(`
        <b>${titulo}</b><br>
        ${descripcion}<br>
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

  abrirModalReporte(): void {
    this.mostrarNuevoReporte = true;
  }

  cerrarModalReporte(): void {
    this.mostrarNuevoReporte = false;
  }

  guardarReporte(datos: any): void {
    this.marcadorService.crear(datos).subscribe({
      next: () => {
        this.toastService.success('Reporte guardado correctamente.');
        this.cerrarModalReporte();
        this.pedirUbicacion();
      },
      error: (err) => {
        console.error('Error guardando reporte:', err);
        this.toastService.error('No se pudo guardar el reporte. Revisa el token y el backend.');
      }
    });
  }
}
