import { Component, OnInit } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { NuevoReporteComponent } from '../components/nuevo-reporte/nuevo-reporte';
import { Marcador, MarcadorService } from '../services/marcador.service';
import { TipoMarcadorService } from '../services/tipo-marcador.service';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NuevoReporteComponent, SlicePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private mapa: L.Map | null = null;
  private marcadoresEnMapa: L.Marker[] = [];

  mostrarNuevoReporte = false;
  marcadores: Marcador[] = [];
  tiposMarcador: any[] = [];
  esInvitado = false;

  constructor(
    private authService: AuthService,
    private marcadorService: MarcadorService,
    private tipoMarcadorService: TipoMarcadorService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.esInvitado = this.authService.isGuestMode();
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
      const marker = L.marker([m.latitud, m.longitud], {
        icon: L.divIcon({
          className: 'emoji-marker-wrapper',
          html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:20px;border-radius:50%;background:rgba(255,255,255,0.92);box-shadow:0 4px 12px rgba(19,41,66,0.2);">${this.iconoPorTipo(m.id_tipo_marcador)}</div>`,
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
        return '\uD83D\uDC4A';
      case 2:
        return '\uD83D\uDEE0\uFE0F';
      case 3:
        return '\uD83D\uDEE1\uFE0F';
      case 4:
        return '\u203C\uFE0F';
      default:
        return '\uD83D\uDCCD';
    }
  }

  abrirModalReporte(): void {
    if (this.esInvitado) {
      this.toastService.error('Modo invitado: solo puedes visualizar el contenido.');
      return;
    }
    this.mostrarNuevoReporte = true;
  }

  cerrarModalReporte(): void {
    this.mostrarNuevoReporte = false;
  }

  guardarReporte(datos: any): void {
    if (this.esInvitado) {
      this.toastService.error('Modo invitado: no puedes crear reportes.');
      return;
    }

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
