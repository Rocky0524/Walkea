import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth';
@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.css'
})
export class BienvenidaComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  entrarComoInvitado(): void {
    this.authService.startGuestMode();
    this.router.navigate(['/app/dashboard']);
  }
}
