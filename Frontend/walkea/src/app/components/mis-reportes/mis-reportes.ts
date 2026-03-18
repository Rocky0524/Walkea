import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-mis-reportes',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './mis-reportes.html',
  styleUrl: './mis-reportes.css',
})
export class MisReportes {
  misReportes = [
    { descripcion: 'Bache enorme', latitud: 41.61, longitud: 0.62, estado: 'activo', vida: 5 },
    { descripcion: 'Farola fundida', latitud: 41.615, longitud: 0.622, estado: 'activo', vida: 8 }
  ];
}