import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { RegistroComponent } from './registro/registro';
import { BienvenidaComponent } from './bienvenida/bienvenida';
import { LayoutComponent } from './layout/layout';
import { DashboardComponent } from './dashboard/dashboard';
import { MapaComponent } from './mapa/mapa';
import { ReportesVotosComponent } from './reportes-votos/reportes-votos';
import { PerfilPageComponent } from './perfil-page/perfil-page';
import { AjustesPageComponent } from './ajustes-page/ajustes-page';
import { authGuard } from './auth.guard';

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
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'mapa', component: MapaComponent },
      { path: 'mis-reportes', component: ReportesVotosComponent },
      { path: 'perfil', component: PerfilPageComponent },
      { path: 'ajustes', component: AjustesPageComponent },
    ]
  }
];
