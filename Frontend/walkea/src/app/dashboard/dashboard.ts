import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MarcadorService } from '../services/marcador.service';
import { TipoMarcadorService } from '../services/tipo-marcador.service';
import * as L from 'leaflet';
import { NuevoReporteComponent } from '../components/nuevo-reporte/nuevo-reporte';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NuevoReporteComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  private mapa: any;
  private marcadoresEnMapa: any[] = [];
  mostrarNuevoReporte: boolean = false;

  marcadores: any[] = [];
  tiposMarcador: any[] = [];

  // colores que le ponemos a cada tipo de marcador, uno por cada tipo del seeder
  colores: string[] = ['#e74c3c', '#f39c12', '#3498db', '#2ecc71', '#9b59b6'];

  constructor(
    private marcadorService: MarcadorService,
    private tipoMarcadorService: TipoMarcadorService
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

  // pedimos la ubicacion del usuario para centrar el mapa y cargar marcadores cercanos
  private pedirUbicacion(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          this.mapa.setView([lat, lng], 15);

          L.marker([lat, lng]).addTo(this.mapa)
            .bindPopup('<b>Estás aquí</b>')
            .openPopup();

          this.cargarCercanos(lat, lng);
        },
        () => {
          // si no da permiso cargamos todos
          this.cargarTodos();
        }
      );
    } else {
      this.cargarTodos();
    }
  }

  private cargarCercanos(lat: number, lng: number): void {
    this.marcadorService.obtenerCercanos(lat, lng).subscribe({
      next: (data) => {
        this.marcadores = data;
        this.pintarMarcadores();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  private cargarTodos(): void {
    this.marcadorService.obtenerTodos().subscribe({
      next: (data) => {
        this.marcadores = data;
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

  // pintamos cada marcador como un circulito con el color de su tipo
  private pintarMarcadores(): void {
    this.marcadores.forEach((m) => {
      const idx = this.tiposMarcador.findIndex(t => t.id_tipo_marcador === m.id_tipo_marcador);
      const color = this.colores[idx] || '#999';

      const circulo = L.circleMarker([m.latitud, m.longitud], {
        radius: 10,
        fillColor: color,
        color: '#fff',
        weight: 2,
        fillOpacity: 0.9
      }).addTo(this.mapa);

      const tipoNombre = m.tipo_marcador?.nombre || 'Sin tipo';
      circulo.bindPopup(`
        <b>${tipoNombre}</b><br>
        ${m.descripcion}<br>
        <small>Estado: ${m.estado}</small>
      `);

      this.marcadoresEnMapa.push(circulo);
    });
  }

  getColor(i: number): string {
    return this.colores[i] || '#999';
  }

  abrirModalReporte() {
    this.mostrarNuevoReporte = true;
  }

  cerrarModalReporte() {
    this.mostrarNuevoReporte = false;
  }

  guardarReporte(datos: any) {
    this.marcadorService.crear(datos).subscribe({
      next: (res) => {
        alert('¡Reporte guardado de verdad en la base de datos!');
        this.cerrarModalReporte();
        
        // Limpiamos los marcadores del mapa para no duplicarlos
        this.marcadoresEnMapa.forEach(m => this.mapa.removeLayer(m));
        this.marcadoresEnMapa = [];
        
        // Recargamos los datos (cercanos o todos)
        this.pedirUbicacion(); 
      },
      error: (err) => {
        console.error('Error guardando reporte:', err);
        alert('Error al guardar en la BD. Asegúrate de tener token JWT y backend encendido.');
      }
    });
  }
}
