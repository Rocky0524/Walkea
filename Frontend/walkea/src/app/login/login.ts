import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; 
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css' 
})
export class LoginComponent {
loginForm = new FormGroup({
email: new FormControl("",[Validators.required, Validators.email]),
password: new FormControl("", [Validators.required, Validators.minLength(6)])
})

onSubmit(){
  if (this.loginForm.valid){
    console.log('Todo correcto. Listo para enviar a laravel:', this.loginForm.value);
  }else {
    console.log('Hay errores');
    this.loginForm.markAllAsTouched();
  }
}


}