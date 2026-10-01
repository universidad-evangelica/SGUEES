import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AcaProspectoComponent } from './aca-prospecto/aca-prospecto.component';

// Prospectos: una sola pantalla para dos opciones de menú (SEG_OPCION_SISTEMA ACA_PROSPECTO y
// ACA_PROSPECTO_ECONOMICO). data.vista decide qué pestañas muestra; cada ruta tiene su propio permiso.
const routes: Routes = [
  {
    path: 'aca-prospecto-academico',
    component: AcaProspectoComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Prospectos Académica', vista: 'academico' },
    loadChildren: () => import('./aca-prospecto/aca-prospecto.module').then((m) => m.AcaProspectoModule),
  },
  {
    path: 'aca-prospecto-economico',
    component: AcaProspectoComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Prospectos Socioeconómica', vista: 'economico' },
    loadChildren: () => import('./aca-prospecto/aca-prospecto.module').then((m) => m.AcaProspectoModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademicsRoutingModule { }
