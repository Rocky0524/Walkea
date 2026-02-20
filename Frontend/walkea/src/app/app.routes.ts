import { Routes } from '@angular/router';
import { LoginComponent } from './login/login'; 
import { Registro } from './registro/registro'; 

export const routes: Routes = [

  // 1. Ruta por defecto: Si el usuario entra a la raíz, va directo al login
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  // 2. Ruta para cargar la pantalla de login
  { path: 'login', component: LoginComponent },

  // 3. Ruta para cargar la pantalla de registro
  { path: 'registro', component: Registro },
];