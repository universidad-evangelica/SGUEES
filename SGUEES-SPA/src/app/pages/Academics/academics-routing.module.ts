import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AcaProspectoComponent } from './aca-prospecto/aca-prospecto.component';
import { AcaProspectoBecaComponent } from './aca-prospecto-beca/aca-prospecto-beca.component';

const routes: Routes = [
  {
    path: 'aca-prospecto',
    component: AcaProspectoComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Prospectos' },
    loadChildren: () => import('./aca-prospecto/aca-prospecto.module').then((m) => m.AcaProspectoModule),
  },
  {
    path: 'aca-prospecto-beca',
    component: AcaProspectoBecaComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Solicitudes de beca' },
    loadChildren: () => import('./aca-prospecto-beca/aca-prospecto-beca.module').then((m) => m.AcaProspectoBecaModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademicsRoutingModule { }
