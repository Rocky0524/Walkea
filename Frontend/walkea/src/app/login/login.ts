import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth'; 
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

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Enviando datos a Laravel...', this.loginForm.value);
      
      this.authService.login(this.loginForm.value).subscribe({
        

        next: (respuesta) => {
          console.log('¡Login correcto!', respuesta);
          this.router.navigate(['/bienvenida']); 
        },
        
        error: (error) => {
          console.error('Error en el login:', error);
          alert('Credenciales incorrectas o el servidor de Anas está apagado.');
        }
        
      });

    } else {
      this.loginForm.markAllAsTouched(); 
    }
  }
}