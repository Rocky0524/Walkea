import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PerfilResponse, PerfilService } from '../services/perfil.service';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.css'
})
export class PerfilPageComponent implements OnInit {
  perfil: PerfilResponse | null = null;
  cargando = true;
  error = '';

  constructor(private perfilService: PerfilService) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.error = '';

    this.perfilService.obtenerPerfil().subscribe({
      next: (respuesta) => {
        this.perfil = respuesta;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el perfil. Revisa si el backend esta encendido y si has iniciado sesion.';
        this.cargando = false;
      }
    });
  }

  getInicial(): string {
    return this.perfil?.usuario.nombre.charAt(0).toUpperCase() || 'W';
  }
}
