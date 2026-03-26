import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nuevo-reporte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-reporte.html',
  styleUrl: './nuevo-reporte.css'
})
export class NuevoReporteComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Output() enviar = new EventEmitter<any>();

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

  cancelar() {
    this.cerrar.emit();
  }

  enviarReporte() {
    if (!this.tipoSeleccionado) {
      alert("Por favor selecciona un tipo de reporte.");
      return;
    }
    
    // Datos formateados como espera el backend de Laravel
    const data = {
      id_tipo_marcador: this.tipoSeleccionado,
      descripcion: this.descripcion || 'Sin descripción', // Laravel pide descripcion required
      latitud: 41.6167, // Fijo por ahora
      longitud: 0.6222
    };

    this.enviar.emit(data);
  }
}
