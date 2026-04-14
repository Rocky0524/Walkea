import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Marcador, MarcadorService } from '../services/marcador.service';

@Component({
  selector: 'app-reportes-votos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes-votos.html',
  styleUrl: './reportes-votos.css'
})
export class ReportesVotosComponent implements OnInit {
  reportes: Marcador[] = [];
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
        this.reportes = data.map(m => ({ ...m, hp_vida: m.hp_vida ?? m.vida }));
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los reportes.';
        this.cargando = false;
      }
    });
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
        this.mensaje = `Voto ${tipo} aplicado con peso ${respuesta.peso_voto}.`;
        this.votoEnCursoId = null;
      },
      error: (err) => {
        this.error = err?.error?.mensaje || 'No se pudo registrar el voto.';
        this.votoEnCursoId = null;
      }
    });
  }
}
