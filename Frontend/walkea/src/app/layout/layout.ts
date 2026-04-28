import { DatePipe } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../auth';
import { Notificacion, NotificacionService } from '../services/notificacion.service';
import { PerfilService } from '../services/perfil.service';
import { ToastService } from '../services/toast.service';
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
  menuUsuarioAbierto = false;
  notificaciones: Notificacion[] = [];
  notificacionesNoLeidas = 0;
  nombreUsuario = 'Usuario';
  rangoUsuario = 'Novato';
  rolUsuario = 'usuario';
  esInvitado = false;
  inicialUsuario = 'U';

  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private notificacionService: NotificacionService,
    private perfilService: PerfilService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.esInvitado = this.authService.isGuestMode();

    if (this.esInvitado) {
      this.nombreUsuario = 'Invitado';
      this.rangoUsuario = 'Solo lectura';
      this.rolUsuario = 'invitado';
      this.inicialUsuario = 'I';
    } else {
      this.cargarPerfil();
      this.notificacionService.actualizarDesdeBackend();
    }

    this.subscriptions.add(
      this.notificacionService.notificaciones$.subscribe((items) => {
        this.notificaciones = items;
        this.notificacionesNoLeidas = items.filter((item) => !item.leida).length;
      })
    );

    this.subscriptions.add(
      interval(30000).subscribe(() => {
        if (!this.esInvitado) {
          this.notificacionService.actualizarDesdeBackend();
        }
      })
    );

    this.subscriptions.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.cerrarMenu();
          this.cerrarNotificaciones();
          this.cerrarMenuUsuario();
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

    if (this.menuUsuarioAbierto) {
      this.cerrarMenuUsuario();
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

  toggleMenuUsuario(): void {
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;
  }

  cerrarMenuUsuario(): void {
    this.menuUsuarioAbierto = false;
  }

  vaciarNotificaciones(): void {
    this.notificacionService.vaciar();
  }

  irAPerfil(): void {
    this.cerrarMenuUsuario();
    if (this.esInvitado) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/app/perfil']);
  }

  cerrarSesion(): void {
    if (this.esInvitado) {
      this.finalizarCierreSesion();
      return;
    }

    this.authService.logoutRequest().subscribe({
      next: () => {
        this.finalizarCierreSesion();
      },
      error: () => {
        this.finalizarCierreSesion();
      }
    });
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

  private finalizarCierreSesion(): void {
    this.authService.logout();
    this.menuAbierto = false;
    this.panelNotificacionesAbierto = false;
    this.menuUsuarioAbierto = false;
    this.notificaciones = [];
    this.notificacionesNoLeidas = 0;
    this.toastService.success('Sesion cerrada correctamente.');
    this.router.navigate(['/login']);
  }
}
