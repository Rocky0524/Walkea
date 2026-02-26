import { Routes } from '@angular/router';
import { LoginComponent } from './login/login'; 
import { RegistroComponent } from './registro/registro';
import { BienvenidaComponent } from './bienvenida/bienvenida'; 

export const routes: Routes = [

  // 1. Ruta por defecto: Si el usuario entra a la raíz, va directo al login
  { path: '', redirectTo: '/bienvenida', pathMatch: 'full' },
  
  // 2. Ruta para cargar la pantalla de login
  { path: 'login', component: LoginComponent },

  // 3. Ruta para cargar la pantalla de registro
 { path: 'registro', component: RegistroComponent },

  // 4. Ruta para cargar la pantalla de bienvenida
  { path: 'bienvenida', component: BienvenidaComponent },
];