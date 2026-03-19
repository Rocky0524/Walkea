import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-mis-reportes',
  standalone: true,
  imports: [CommonModule,RouterLink,RouterLinkActive],
  templateUrl: './mis-reportes.html',
  styleUrl: './mis-reportes.css',
})
export class MisReportes {
  // Estos datos luego vendrán del servicio de Anas vía API
  misReportes = [
    { descripcion: 'Bache enorme en la entrada', latitud: 41.6177, longitud: 0.6267, estado: 'activo', vida: 5 },
    { descripcion: 'Farola rota frente al parque', latitud: 41.6150, longitud: 0.6220, estado: 'activo', vida: 8 }
  ];

  eliminarReporte(reporte: any) {
    if(confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      this.misReportes = this.misReportes.filter(r => r !== reporte);
      console.log('Reporte eliminado localmente');
    }
  }
}