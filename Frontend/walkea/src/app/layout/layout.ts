import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { Notificacion, NotificacionService } from '../services/notificacion.service';

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

  private subscriptions = new Subscription();

  constructor(private notificacionService: NotificacionService) {}

  ngOnInit(): void {
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
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

  vaciarNotificaciones(): void {
    this.notificacionService.vaciar();
  }
}
