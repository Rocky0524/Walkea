import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { RegistroComponent } from './registro/registro';
import { BienvenidaComponent } from './bienvenida/bienvenida';
import { LayoutComponent } from './layout/layout';
import { DashboardComponent } from './dashboard/dashboard';
import { MapaComponent } from './mapa/mapa';
import { MisReportes } from './components/mis-reportes/mis-reportes';
import { Perfil } from './components/perfil/perfil'; 
import { Ajustes } from './components/ajustes/ajustes';

export const routes: Routes = [
  // Rutas publicas (sin sidebar)
  { path: '', redirectTo: '/bienvenida', pathMatch: 'full' },
  { path: 'bienvenida', component: BienvenidaComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },

  // Rutas con layout (sidebar + router-outlet)
  {
    path: 'app',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'mapa', component: MapaComponent },
      { path: 'mis-reportes', component: MisReportes },
      { path: 'perfil', component: Perfil},
      { path: 'ajustes', component: Ajustes },
    ]
  }
];