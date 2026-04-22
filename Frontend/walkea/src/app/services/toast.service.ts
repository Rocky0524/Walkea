import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastItem {
  id: number;
  tipo: 'success' | 'error' | 'info';
  texto: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly duracionPorDefecto = 3500;
  private contador = 0;
  private toastsSubject = new BehaviorSubject<ToastItem[]>([]);

  readonly toasts$ = this.toastsSubject.asObservable();

  success(texto: string, duracion = this.duracionPorDefecto): void {
    this.mostrar('success', texto, duracion);
  }

  error(texto: string, duracion = this.duracionPorDefecto): void {
    this.mostrar('error', texto, duracion);
  }

  info(texto: string, duracion = this.duracionPorDefecto): void {
    this.mostrar('info', texto, duracion);
  }

  quitar(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter((toast) => toast.id !== id));
  }

  private mostrar(tipo: ToastItem['tipo'], texto: string, duracion: number): void {
    const id = ++this.contador;
    const toast: ToastItem = { id, tipo, texto };

    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    window.setTimeout(() => {
      this.quitar(id);
    }, duracion);
  }
}
