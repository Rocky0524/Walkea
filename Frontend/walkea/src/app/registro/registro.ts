import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth';
import { resolveAppRole } from '../utils/role.util';

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

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.registreForm.valid) {
      this.registreForm.markAllAsTouched();
      alert('Completa todos los campos correctamente.');
      return;
    }

    const formValue = this.registreForm.getRawValue();

    if (formValue.password !== formValue.confirmPassword) {
      alert('Las contraseñas no coinciden');
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
        const usuario = respuesta?.usuario ?? null;
        const email = String(usuario?.email ?? formValue.email ?? '').trim().toLowerCase();
        localStorage.setItem('rol', resolveAppRole(usuario));
        localStorage.setItem('email', email);
        this.router.navigate(['/app/dashboard']);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        alert('Error al registrar el usuario en el backend.');
      }
    });
  }
}
