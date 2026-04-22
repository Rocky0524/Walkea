import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth';
import { resolveAppRole } from '../utils/role.util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (respuesta) => {
        localStorage.setItem('token', respuesta.token);
        const usuario = respuesta?.usuario ?? null;
        const email = String(usuario?.email ?? '').trim().toLowerCase();
        localStorage.setItem('rol', resolveAppRole(usuario));
        localStorage.setItem('email', email);
        this.router.navigate(['/app/dashboard']);
      },
      error: (error) => {
        console.error('Error en el login:', error);
        alert('Credenciales incorrectas o backend apagado.');
      }
    });
  }
}
