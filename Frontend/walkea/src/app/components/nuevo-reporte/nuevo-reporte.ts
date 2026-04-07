import { Component, EventEmitter, Output, AfterViewInit } from '@angular/core';
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
  latitudReal: number = 41.6167; // Por defecto Lleida
  longitudReal: number = 0.6222; // Por defecto Lleida

  // ID según el seeder (1: Peligro, 2: Obras, 3: Zona segura, 4: Otros)
  // En este diseño: Peligro, Obras, Zona segura, Otros.
  tipoSeleccionado: number | null = null;
  descripcion: string = '';

  // Mapeamos los ID a los que existen en la BD real (1 al 5) según el seeder
  tipos = [
    { id: 1, nombre: 'Peligro', icono: '👊' },
    { id: 2, nombre: 'Obras', icono: '🛠️' },
    { id: 3, nombre: 'Zona segura', icono: '🕒' },
    { id: 4, nombre: 'Otros..', icono: '⁉️' } // Usamos el ID 4 en vez de 6 para no fallar la validación
  ];

  seleccionarTipo(id: number) {
    this.tipoSeleccionado = id;
  }

  ngAfterViewInit() {
    // Timeout pequeño para dar tiempo a que Angular monte el #mapa-nuevo-reporte en el DOM
    setTimeout(() => {
      this.initMap();
      this.obtenerUbicacion();
    }, 100);
  }

  private initMap() {
    this.map = L.map('mapa-nuevo-reporte').setView([this.latitudReal, this.longitudReal], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  private obtenerUbicacion() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.latitudReal = pos.coords.latitude;
          this.longitudReal = pos.coords.longitude;
          
          this.map.setView([this.latitudReal, this.longitudReal], 16);
          L.marker([this.latitudReal, this.longitudReal]).addTo(this.map)
            .bindPopup('<b>Aquí estás</b>').openPopup();
        },
        (error) => {
          console.error("GPS denegado o error.", error);
          // Si deniegan, dejamos las coordenadas por defecto
          L.marker([this.latitudReal, this.longitudReal]).addTo(this.map)
            .bindPopup('<b>Ubicación por defecto</b>').openPopup();
        }
      );
    }
  }

  cancelar() {
    this.cerrar.emit();
  }

  enviarReporte() {
    if (!this.tipoSeleccionado) {
      alert("Por favor selecciona un tipo de reporte.");
      return;
    }
    
    // Datos formateados como espera el backend de Laravel usando tu ubicación real
    const data = {
      id_tipo_marcador: this.tipoSeleccionado,
      descripcion: this.descripcion || 'Sin descripción',
      latitud: this.latitudReal,
      longitud: this.longitudReal
    };

    this.enviar.emit(data);
  }
}
