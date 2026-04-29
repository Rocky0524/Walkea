import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoRelativo',
  standalone: true
})
export class TiempoRelativoPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const fecha = new Date(value);

    if (isNaN(fecha.getTime())) {
      return '';
    }

    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffSeg = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSeg / 60);
    const diffHoras = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffSeg < 60) {
      return 'Ahora mismo';
    }

    if (diffMin < 60) {
      return `Hace ${diffMin} min`;
    }

    if (diffHoras < 24) {
      return `Hace ${diffHoras}h`;
    }

    if (diffDias === 1) {
      return 'Ayer';
    }

    if (diffDias < 7) {
      return `Hace ${diffDias} días`;
    }

    if (diffDias < 30) {
      const semanas = Math.floor(diffDias / 7);
      return `Hace ${semanas} sem`;
    }

    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}
