import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth';
import { ToastService } from '../services/toast.service';

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

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (respuesta) => {
          localStorage.setItem('token', respuesta.token);
          this.toastService.success('Sesion iniciada correctamente.');
          this.router.navigate(['/app/dashboard']);
        },
        error: (error) => {
          console.error('Error en el login:', error);
          const mensaje = error?.error?.mensaje || 'Credenciales incorrectas o servidor no disponible.';
          this.toastService.error(mensaje);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.toastService.error('Revisa el email y la contrasena antes de entrar.');
    }
  }
}
