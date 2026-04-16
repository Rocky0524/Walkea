import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Marcador, MarcadorService } from '../../services/marcador.service';

@Component({
  selector: 'app-mis-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-reportes.html',
  styleUrl: './mis-reportes.css',
})
export class MisReportes implements OnInit {
  misReportes: Marcador[] = [];
  cargando = true;
  votoEnCursoId: number | null = null;
  mensaje = '';
  error = '';

  constructor(private marcadorService: MarcadorService) {}

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes(): void {
    this.cargando = true;
    this.error = '';

    this.marcadorService.obtenerTodos().subscribe({
      next: (data) => {
        this.misReportes = data.map(m => ({ 
          ...m, 
          hp_vida: m.hp_vida ?? m.vida,
          latitud: Number(m.latitud),
          longitud: Number(m.longitud),
          estado: m.estado || 'desconocido'
        }));
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los reportes.';
        this.cargando = false;
      }
    });
  }

  eliminarReporte(reporte: Marcador) {
    if(confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      this.marcadorService.eliminar(reporte.id_marcador).subscribe({
        next: () => {
          this.misReportes = this.misReportes.filter(r => r.id_marcador !== reporte.id_marcador);
          this.mensaje = 'Reporte eliminado correctamente.';
          this.error = '';
        },
        error: (err) => {
          this.error = err?.error?.mensaje || 'No se pudo eliminar el reporte. Es posible que no tengas permisos.';
          this.mensaje = '';
        }
      });
    }
  }

  votar(reporte: Marcador, tipo: 'positivo' | 'negativo') {
    this.votoEnCursoId = reporte.id_marcador;
    this.mensaje = '';
    this.error = '';

    this.marcadorService.votar(reporte.id_marcador, tipo).subscribe({
      next: (respuesta) => {
        reporte.vida = respuesta.vida_marcador;
        reporte.hp_vida = respuesta.hp_vida;
        if (respuesta.hp_vida === 0) {
          reporte.estado = 'agotado';
        }
        this.mensaje = `Voto ${tipo} aplicado.`;
        this.votoEnCursoId = null;
      },
      error: (err) => {
        this.error = err?.error?.mensaje || 'No se pudo registrar el voto.';
        this.votoEnCursoId = null;
      }
    });
  }
}
