import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AcaBecOrigenBecaComponent } from './aca-bec-origen-beca/aca-bec-origen-beca.component';
import { AcaBecRequisitoComponent } from './aca-bec-requisito/aca-bec-requisito.component';
import { AcaBecTipoComponent } from './aca-bec-tipo/aca-bec-tipo.component';

const routes: Routes = [
  {
    path: 'aca-bec-origen-beca',
    component: AcaBecOrigenBecaComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Origen de Beca' },
    loadChildren: () => import('./aca-bec-origen-beca/aca-bec-origen-beca.module').then((m) => m.AcaBecOrigenBecaModule),
  },
  {
    path: 'aca-bec-tipo',
    component: AcaBecTipoComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Tipos de Beca' },
    loadChildren: () => import('./aca-bec-tipo/aca-bec-tipo.module').then((m) => m.AcaBecTipoModule),
  },
  {
    path: 'aca-bec-requisito',
    component: AcaBecRequisitoComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Requisitos de Beca' },
    loadChildren: () => import('./aca-bec-requisito/aca-bec-requisito.module').then((m) => m.AcaBecRequisitoModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademicsRoutingModule { }
