import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; 
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

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

  onSubmit(){
    if (this.registreForm.valid){
      console.log('Todo correcto. Listo para enviar a laravel:', this.registreForm.value);
    } else {
      console.log('Hay errores');
      this.registreForm.markAllAsTouched();
    }
  }
}