import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router'; 
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent {
  
  registreForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl("", [Validators.required]) 
  });

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(){
    console.log('Botón clickeado, validando formulario...');
    if (this.registreForm.valid){
      const formValue = this.registreForm.value;
      if (formValue.password !== formValue.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      
      const payload = {
        nombre: formValue.name,
        email: formValue.email,
        password: formValue.password
      };
      
      console.log('Todo correcto. Listo para enviar a laravel:', payload);
      this.authService.registro(payload).subscribe({
        next: (respuesta) => {
          console.log('¡Registro correcto!', respuesta);
          localStorage.setItem('token', respuesta.token);
          this.router.navigate(['/app/dashboard']);
        },
        error: (err) => {
          console.error('Error en registro:', err);
          alert('Error al registrar el usuario en el backend (revisa la consola para más detalles).');
        }
      });
    } else {
      console.log('El formulario tiene errores de validación', this.registreForm.errors);
      alert('Por favor, rellena todos los campos correctamente. (Revisa si el email es válido y la contraseña tiene 6 o más caracteres).');
      this.registreForm.markAllAsTouched();
    }
  }
}