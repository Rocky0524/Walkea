import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent {
  registreForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit(): void {
    if (this.registreForm.valid) {
      const formValue = this.registreForm.value;

      if (formValue.password !== formValue.confirmPassword) {
        this.toastService.error('Las contrasenas no coinciden.');
        return;
      }

      const payload = {
        nombre: formValue.name,
        email: formValue.email,
        password: formValue.password
      };

      this.authService.registro(payload).subscribe({
        next: (respuesta) => {
          localStorage.setItem('token', respuesta.token);
          localStorage.removeItem('modo');
          this.toastService.success('Cuenta creada correctamente.');
          this.router.navigate(['/app/dashboard']);
        },
        error: (err) => {
          console.error('Error en registro:', err);
          const mensaje = err?.error?.mensaje || 'No se pudo registrar el usuario.';
          this.toastService.error(mensaje);
        }
      });
    } else {
      this.registreForm.markAllAsTouched();
      this.toastService.error('Rellena bien todos los campos antes de registrarte.');
    }
  }
}
