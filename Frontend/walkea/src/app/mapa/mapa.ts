import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css'
})
export class MapaComponent implements OnInit {
  private map: any;

  constructor() {}

  ngOnInit(): void {
    this.initMap();
    this.obtenerUbicacionReal();
  }

  private initMap(): void {
    this.map = L.map('map').setView([41.6167, 0.6222], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 3,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    //para borrar
    const marcadorPrueba = L.marker([41.6177, 0.6267]).addTo(this.map);
    marcadorPrueba.bindPopup(`
      <b>¡Primer reporte! 🚨</b><br>
      Farola fundida en la subida a la Seu Vella.
    `).openPopup();
  }

  private obtenerUbicacionReal(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          this.map.setView([lat, lon], 16);

          L.marker([lat, lon]).addTo(this.map)
            .bindPopup('<b>¡Estás aquí, Kenneth!</b>')
            .openPopup();
        },
        (error) => {
          console.error('Error obteniendo la ubicación o permiso denegado', error);
        }
      );
    } else {
      console.log('Tu navegador no soporta geolocalización');
    }
  }
}