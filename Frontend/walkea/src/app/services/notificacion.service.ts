import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, map, switchMap, catchError } from 'rxjs';
import { AuthService } from '../auth';
import { Marcador, MarcadorService } from './marcador.service';

export interface Notificacion {
  id: string;
  texto: string;
  fecha: string;
  leida: boolean;
  marcadorId: number;
}

interface SnapshotReporte {
  hp: number;
  estado: string;
  titulo: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private readonly storageKey = 'walkea_notificaciones';
  private readonly snapshotKey = 'walkea_reportes_snapshot';

  private notificacionesSubject = new BehaviorSubject<Notificacion[]>(this.cargarNotificaciones());
  notificaciones$ = this.notificacionesSubject.asObservable();
  noLeidas$ = this.notificaciones$.pipe(
    map((items) => items.filter((item) => !item.leida).length)
  );

  constructor(
    private authService: AuthService,
    private marcadorService: MarcadorService
  ) {}

  actualizarDesdeBackend(): void {
    this.authService.me().pipe(
      switchMap((usuario) => {
        const idUsuario = Number(usuario?.id_usuario ?? usuario?.id ?? 0);

        if (!idUsuario) {
          return EMPTY;
        }

        return this.marcadorService.obtenerTodos().pipe(
          map((lista) => ({
            idUsuario,
            marcadores: this.marcadorService.normalizarLista(lista as any[])
          }))
        );
      }),
      catchError(() => EMPTY)
    ).subscribe(({ idUsuario, marcadores }) => {
      const propios = marcadores.filter((marcador) => {
        const creadorId = Number(marcador.id_usuario ?? marcador.usuario?.id_usuario ?? 0);
        return creadorId === idUsuario;
      });

      this.detectarCambios(propios);
    });
  }

  marcarTodasComoLeidas(): void {
    const actualizadas = this.notificacionesSubject.value.map((item) => ({
      ...item,
      leida: true
    }));

    this.actualizarNotificaciones(actualizadas);
  }

  vaciar(): void {
    this.actualizarNotificaciones([]);
  }

  private detectarCambios(marcadores: Marcador[]): void {
    const anterior = this.cargarSnapshot();
    const nuevo: Record<number, SnapshotReporte> = {};
    const notificaciones = [...this.notificacionesSubject.value];

    for (const marcador of marcadores) {
      const id = marcador.id_marcador;
      const hpActual = Number(marcador.hp_vida ?? marcador.vida ?? 0);
      const estadoActual = String(marcador.estado ?? 'activo');
      const titulo = marcador.titulo || marcador.descripcion || `Reporte #${id}`;

      nuevo[id] = {
        hp: hpActual,
        estado: estadoActual,
        titulo
      };

      const previo = anterior[id];
      if (!previo) {
        continue;
      }

      if (previo.hp === hpActual && previo.estado === estadoActual) {
        continue;
      }

      let texto = `Tu reporte "${titulo}" ha recibido un voto. HP: ${previo.hp} -> ${hpActual}.`;
      if (hpActual === 0 && previo.hp > 0) {
        texto = `Tu reporte "${titulo}" ha llegado a 0 HP y ha quedado agotado.`;
      } else if (previo.estado !== estadoActual) {
        texto = `Tu reporte "${titulo}" ha cambiado de estado: ${previo.estado} -> ${estadoActual}.`;
      }

      notificaciones.unshift({
        id: `${id}-${Date.now()}-${hpActual}`,
        texto,
        fecha: new Date().toISOString(),
        leida: false,
        marcadorId: id
      });
    }

    this.guardarSnapshot(nuevo);
    this.actualizarNotificaciones(notificaciones.slice(0, 20));
  }

  private actualizarNotificaciones(items: Notificacion[]): void {
    this.notificacionesSubject.next(items);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private cargarNotificaciones(): Notificacion[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private cargarSnapshot(): Record<number, SnapshotReporte> {
    try {
      const raw = localStorage.getItem(this.snapshotKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private guardarSnapshot(snapshot: Record<number, SnapshotReporte>): void {
    localStorage.setItem(this.snapshotKey, JSON.stringify(snapshot));
  }
}
