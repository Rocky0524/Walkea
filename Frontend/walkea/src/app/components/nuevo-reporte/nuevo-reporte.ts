import { AfterViewInit, Component, EventEmitter, HostListener, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { ToastService } from '../../services/toast.service';

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

  private map!: L.Map;
  latitudReal = 41.6167;
  longitudReal = 0.6222;

  tipoSeleccionado: number | null = null;
  titulo = '';
  descripcion = '';

  tipos = [
    { id: 1, nombre: 'Peligro', icono: '\uD83D\uDC4A' },
    { id: 2, nombre: 'Obras', icono: '\uD83D\uDEE0\uFE0F' },
    { id: 3, nombre: 'Zona segura', icono: '\uD83D\uDEE1\uFE0F' },
    { id: 4, nombre: 'Otros', icono: '\u203C\uFE0F' }
  ];

  constructor(private toastService: ToastService) {}

  seleccionarTipo(id: number): void {
    this.tipoSeleccionado = id;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
      this.obtenerUbicacion();
    }, 100);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancelar();
  }

  private initMap(): void {
    this.map = L.map('mapa-nuevo-reporte').setView([this.latitudReal, this.longitudReal], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
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
          .bindPopup('<b>Estas aqui</b>')
          .openPopup();
      },
      (error) => {
        console.error('GPS denegado o error.', error);
        L.marker([this.latitudReal, this.longitudReal]).addTo(this.map)
          .bindPopup('<b>Ubicacion por defecto</b>')
          .openPopup();
      }
    );
  }

  cancelar(): void {
    this.cerrar.emit();
  }

  enviarReporte(): void {
    if (!this.tipoSeleccionado) {
      this.toastService.error('Selecciona un tipo de reporte antes de enviarlo.');
      return;
    }

    if (!this.titulo.trim()) {
      this.toastService.error('Escribe un titulo para el reporte.');
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
