import { Routes } from '@angular/router';
import { LoginComponent } from './login/login'; 
import { RegistroComponent } from './registro/registro';
import { BienvenidaComponent } from './bienvenida/bienvenida'; 
import { MapaComponent } from './mapa/mapa'; 
export const routes: Routes = [
  { path: '', redirectTo: '/bienvenida', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'bienvenida', component: BienvenidaComponent },
  
  { path: 'dashboard', component: MapaComponent },
  
  { 
    path: 'mis-reportes', 
    loadComponent: () => import('./mis-reportes/mis-reportes')
      .then(m => m.MisReportesComponent) 
  },
];