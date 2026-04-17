import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

@Component({
  selector: 'app-nuevo-reporte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-reporte.html',
  styleUrl: './nuevo-reporte.css'
})
export class NuevoReporteComponent implements AfterViewInit {
  @Output() cerrar = new EventEmitter<void>();
  @Output() enviar = new EventEmitter<any>();

  private map: any;
  latitudReal: number = 41.6167;
  longitudReal: number = 0.6222;

  tipoSeleccionado: number | null = null;
  titulo: string = '';
  descripcion: string = '';

  tipos = [
    { id: 1, nombre: 'Peligro', icono: '👊' },
    { id: 2, nombre: 'Obras', icono: '🛠️' },
    { id: 3, nombre: 'Zona segura', icono: '🕒' },
    { id: 4, nombre: 'Otros', icono: '‼️' }
  ];

  seleccionarTipo(id: number): void {
    this.tipoSeleccionado = id;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
      this.obtenerUbicacion();
    }, 100);
  }

  private initMap(): void {
    this.map = L.map('mapa-nuevo-reporte').setView([this.latitudReal, this.longitudReal], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  private obtenerUbicacion(): void {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.latitudReal = pos.coords.latitude;
        this.longitudReal = pos.coords.longitude;

        this.map.setView([this.latitudReal, this.longitudReal], 16);
        L.marker([this.latitudReal, this.longitudReal]).addTo(this.map)
          .bindPopup('<b>Aqui estas</b>').openPopup();
      },
      (error) => {
        console.error('GPS denegado o error.', error);
        L.marker([this.latitudReal, this.longitudReal]).addTo(this.map)
          .bindPopup('<b>Ubicacion por defecto</b>').openPopup();
      }
    );
  }

  cancelar(): void {
    this.cerrar.emit();
  }

  enviarReporte(): void {
    if (!this.tipoSeleccionado) {
      alert('Por favor selecciona un tipo de reporte.');
      return;
    }

    if (!this.titulo.trim()) {
      alert('Por favor escribe un titulo para el marcador.');
      return;
    }

    const data = {
      id_tipo_marcador: this.tipoSeleccionado,
      titulo: this.titulo.trim(),
      descripcion: this.descripcion || 'Sin descripcion',
      latitud: this.latitudReal,
      longitud: this.longitudReal
    };

    this.enviar.emit(data);
  }
}
