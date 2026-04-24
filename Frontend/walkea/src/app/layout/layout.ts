import { DatePipe } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { Notificacion, NotificacionService } from '../services/notificacion.service';
import { PerfilService } from '../services/perfil.service';
import { resolveAppRole } from '../utils/role.util';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent implements OnInit, OnDestroy {
  menuAbierto = false;
  panelNotificacionesAbierto = false;
  notificaciones: Notificacion[] = [];
  notificacionesNoLeidas = 0;
  nombreUsuario = 'Usuario';
  rangoUsuario = 'Novato';
  rolUsuario = 'usuario';
  inicialUsuario = 'U';

  private subscriptions = new Subscription();

  constructor(
    private notificacionService: NotificacionService,
    private perfilService: PerfilService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();

    this.subscriptions.add(
      this.notificacionService.notificaciones$.subscribe((items) => {
        this.notificaciones = items;
        this.notificacionesNoLeidas = items.filter((item) => !item.leida).length;
      })
    );

    this.notificacionService.actualizarDesdeBackend();

    this.subscriptions.add(
      interval(30000).subscribe(() => {
        this.notificacionService.actualizarDesdeBackend();
      })
    );

    this.subscriptions.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.cerrarMenu();
          this.cerrarNotificaciones();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.panelNotificacionesAbierto) {
      this.cerrarNotificaciones();
    }

    if (this.menuAbierto) {
      this.cerrarMenu();
    }
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  toggleNotificaciones(): void {
    this.panelNotificacionesAbierto = !this.panelNotificacionesAbierto;

    if (this.panelNotificacionesAbierto) {
      this.notificacionService.marcarTodasComoLeidas();
    }
  }

  cerrarNotificaciones(): void {
    this.panelNotificacionesAbierto = false;
  }

  vaciarNotificaciones(): void {
    this.notificacionService.vaciar();
  }

  private cargarPerfil(): void {
    this.perfilService.obtenerPerfil().subscribe({
      next: ({ usuario, estadisticas }) => {
        this.nombreUsuario = usuario.nombre;
        this.rangoUsuario = this.formatearNivel(estadisticas.nivel);
        this.rolUsuario = resolveAppRole(usuario);
        this.inicialUsuario = usuario.nombre.trim().charAt(0).toUpperCase() || 'U';
        localStorage.setItem('rol', this.rolUsuario);
        localStorage.setItem('email', String(usuario.email ?? '').trim().toLowerCase());
      },
      error: () => {
        this.nombreUsuario = 'Usuario';
        this.rangoUsuario = 'Novato';
        this.inicialUsuario = 'U';
      }
    });
  }

  private formatearNivel(nivel: string | null | undefined): string {
    switch (nivel) {
      case 'veterano':
        return 'Veterano';
      case 'medio':
        return 'Medio';
      default:
        return 'Novato';
    }
  }
}
