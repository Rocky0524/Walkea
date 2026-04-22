import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastItem, ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  toasts: ToastItem[] = [];
  protected readonly title = signal('walkea');

  private readonly subscriptions = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.toastService.toasts$.subscribe((items) => {
        this.toasts = items;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  cerrarToast(id: number): void {
    this.toastService.quitar(id);
  }
}
