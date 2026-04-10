import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PerfilResponse, PerfilService } from '../services/perfil.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class PerfilComponent implements OnInit {
  perfil: PerfilResponse | null = null;
  cargando = true;
  guardando = false;
  mensaje = '';
  error = '';

  ajustesForm = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    current_password: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.minLength(6)] }),
    password_confirmation: new FormControl('', { nonNullable: true }),
  });

  constructor(private perfilService: PerfilService) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.error = '';

    this.perfilService.obtenerPerfil().subscribe({
      next: (data) => {
        this.perfil = data;
        this.ajustesForm.patchValue({
          nombre: data.usuario.nombre,
          email: data.usuario.email,
          current_password: '',
          password: '',
          password_confirmation: '',
        });
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar tu perfil. Revisa el login y el backend.';
        this.cargando = false;
      }
    });
  }

  guardarAjustes(): void {
    if (!this.perfil || this.ajustesForm.invalid) {
      this.ajustesForm.markAllAsTouched();
      return;
    }

    const formValue = this.ajustesForm.getRawValue();
    const payload: Record<string, string> = {};

    if (formValue.nombre !== this.perfil.usuario.nombre) {
      payload['nombre'] = formValue.nombre;
    }

    if (formValue.email !== this.perfil.usuario.email) {
      payload['email'] = formValue.email;
    }

    if (formValue.password) {
      if (formValue.password !== formValue.password_confirmation) {
        this.error = 'La nueva contraseña y su confirmación no coinciden.';
        this.mensaje = '';
        return;
      }

      payload['password'] = formValue.password;
      payload['password_confirmation'] = formValue.password_confirmation;
    }

    if (payload['email'] || payload['password']) {
      if (!formValue.current_password) {
        this.error = 'Necesitas la contraseña actual para cambiar email o contraseña.';
        this.mensaje = '';
        return;
      }

      payload['current_password'] = formValue.current_password;
    }

    if (Object.keys(payload).length === 0) {
      this.mensaje = 'No hay cambios para guardar.';
      this.error = '';
      return;
    }

    this.guardando = true;
    this.mensaje = '';
    this.error = '';

    this.perfilService.actualizarAjustes(payload).subscribe({
      next: (response) => {
        this.guardando = false;
        this.mensaje = response.mensaje || 'Cambios guardados.';
        this.cargarPerfil();
      },
      error: (err) => {
        this.guardando = false;
        this.error = err?.error?.mensaje || 'No se pudieron guardar los cambios.';
      }
    });
  }
}
