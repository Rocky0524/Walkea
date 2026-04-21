import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PerfilService, PreferenciasAjustes } from '../services/perfil.service';

@Component({
  selector: 'app-ajustes-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './ajustes-page.html',
  styleUrl: './ajustes-page.css'
})
export class AjustesPageComponent implements OnInit {
  cargando = true;
  guardando = false;
  mensaje = '';
  error = '';
  nombreActual = '';
  emailActual = '';

  preferencias: PreferenciasAjustes = {
    geolocalizacion: true,
    modoOscuro: false
  };

  ajustesForm = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    current_password: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.minLength(6)] }),
    password_confirmation: new FormControl('', { nonNullable: true })
  });

  constructor(private perfilService: PerfilService) {}

  ngOnInit(): void {
    this.preferencias = this.perfilService.obtenerPreferencias();
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.error = '';

    this.perfilService.obtenerPerfil().subscribe({
      next: (respuesta) => {
        this.nombreActual = respuesta.usuario.nombre;
        this.emailActual = respuesta.usuario.email;
        this.ajustesForm.patchValue({
          nombre: this.nombreActual,
          email: this.emailActual,
          current_password: '',
          password: '',
          password_confirmation: ''
        });
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar tus ajustes.';
        this.cargando = false;
      }
    });
  }

  guardar(): void {
    if (this.ajustesForm.invalid) {
      this.ajustesForm.markAllAsTouched();
      return;
    }

    const formValue = this.ajustesForm.getRawValue();

    if (formValue.password && formValue.password !== formValue.password_confirmation) {
      this.error = 'La nueva contrase\u00f1a y la confirmaci\u00f3n no coinciden.';
      this.mensaje = '';
      return;
    }

    const payload: {
      nombre?: string;
      email?: string;
      current_password?: string;
      password?: string;
      password_confirmation?: string;
    } = {};

    if (formValue.nombre !== this.nombreActual) {
      payload.nombre = formValue.nombre;
    }

    if (formValue.email !== this.emailActual) {
      payload.email = formValue.email;
    }

    if (formValue.password) {
      payload.password = formValue.password;
      payload.password_confirmation = formValue.password_confirmation;
    }

    if ((payload.email || payload.password) && !formValue.current_password) {
      this.error = 'Necesitas escribir la contrase\u00f1a actual para cambiar email o contrase\u00f1a.';
      this.mensaje = '';
      return;
    }

    if (formValue.current_password && (payload.email || payload.password)) {
      payload.current_password = formValue.current_password;
    }

    if (Object.keys(payload).length === 0) {
      this.mensaje = 'No hay cambios nuevos para guardar.';
      this.error = '';
      return;
    }

    this.guardando = true;
    this.error = '';
    this.mensaje = '';

    this.perfilService.actualizarAjustes(payload).subscribe({
      next: (respuesta) => {
        this.guardando = false;
        this.mensaje = respuesta.mensaje || 'Ajustes guardados correctamente.';
        this.perfilService.guardarPreferencias(this.preferencias);
        this.nombreActual = respuesta.usuario.nombre;
        this.emailActual = respuesta.usuario.email;
        this.ajustesForm.patchValue({
          nombre: this.nombreActual,
          email: this.emailActual,
          current_password: '',
          password: '',
          password_confirmation: ''
        });
      },
      error: (err) => {
        this.guardando = false;
        this.error = this.obtenerMensajeError(err);
      }
    });
  }

  guardarPreferencias(): void {
    this.perfilService.guardarPreferencias(this.preferencias);
    this.mensaje = 'Preferencias guardadas en este navegador.';
    this.error = '';
  }

  private obtenerMensajeError(err: any): string {
    if (err?.error?.mensaje) {
      return err.error.mensaje;
    }

    if (err?.error?.errors) {
      const primerCampo = Object.keys(err.error.errors)[0];
      if (primerCampo) {
        return err.error.errors[primerCampo][0];
      }
    }

    return 'No se pudieron guardar los cambios.';
  }
}
