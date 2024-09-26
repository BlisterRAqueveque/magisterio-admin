import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { UsuariosComponent } from './features/home/pages/usuarios/usuarios.component';
import { CasasMutualesComponent } from './features/home/pages/casas-mutuales/casas-mutuales.component';
import { HabitacionesComponent } from './features/home/pages/habitaciones/habitaciones.component';
import { ParcelasComponent } from './features/home/pages/parcelas/parcelas.component';
import { ReservasComponent } from './features/home/pages/reservas/reservas.component';
import { authLoginGuard } from './core/guards/auth.guard';
import { ConsejoDirectivoComponent } from './features/home/pages/consejo-directivo/consejo-directivo.component';
import { JuntaFiscalizacionComponent } from './features/home/pages/junta-fiscalizacion/junta-fiscalizacion.component';
import { NoticiasComponent } from './features/home/pages/noticias/noticias.component';
import { ResolucionesComponent } from './features/home/pages/resoluciones/resoluciones.component';
import { DelegacionesComponent } from './features/home/pages/delegaciones/delegaciones.component';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Ingreso',
    component: LoginComponent,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'home',
    title: 'Bienvenido',
    component: HomeComponent,
    children: [
      {
        path: 'usuarios',
        component: UsuariosComponent,
      },
      {
        path: 'casas-mutuales',
        component: CasasMutualesComponent,
      },
      {
        path: 'delegaciones',
        component: DelegacionesComponent,
      },
      {
        path: 'habitaciones',
        component: HabitacionesComponent,
      },
      {
        path: 'parcelas',
        component: ParcelasComponent,
      },
      {
        path: 'reservas',
        component: ReservasComponent,
      },
      {
        path: 'consejo',
        component: ConsejoDirectivoComponent,
      },
      {
        path: 'junta',
        component: JuntaFiscalizacionComponent,
      },
      {
        path: 'noticias',
        component: NoticiasComponent,
      },
      {
        path: 'resol',
        component: ResolucionesComponent,
      },
    ],
    canActivate: [authLoginGuard],
  },
];
