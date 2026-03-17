import { Routes } from '@angular/router';
import { LoginComponent } from './login/login'; 
import { RegistroComponent } from './registro/registro';
import { BienvenidaComponent } from './bienvenida/bienvenida'; 
import { DashboardComponent } from './dashboard/dashboard';
import { MapaComponent } from './mapa/mapa';

export const routes: Routes = [

  { path: '', redirectTo: '/bienvenida', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'bienvenida', component: BienvenidaComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'mapa', component: MapaComponent },
];