import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { ScTipoVacanteComponent } from './sc-tipo-vacante/sc-tipo-vacante.component';
import { ScRequisicionPersonalComponent } from './sc-requisicion-personal/sc-requisicion-personal.component';
import { ScTipoModalidadComponent } from './sc-tipo-modalidad/sc-tipo-modalidad.component';
import { ScTipoContratacionComponent } from './sc-tipo-contratacion/sc-tipo-contratacion.component';

const routes: Routes = [
  {
    path: 'sc-tipo-vacante',
    component: ScTipoVacanteComponent,
    data: { titulo: 'Tipo de Vacante' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-tipo-vacante/sc-tipo-vacante.module').then(m => m.ScTipoVacanteModule)
  },
  {
    path: 'sc-requisicion-personal',
    component: ScRequisicionPersonalComponent,
    data: { titulo: 'Requisicion de personal' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-requisicion-personal/sc-requisicion-personal.module').then(m => m.ScRequisicionPersonalModule)
  },{
    path: 'sc-tipo-modalidad',
    component: ScTipoModalidadComponent,
    data: { titulo: 'Tipo de modalidad' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-tipo-modalidad/sc-tipo-modalidad.module').then(m => m.ScTipoModalidadModule)
  }
  ,{
    path: 'sc-tipo-contratacion',
    component: ScTipoContratacionComponent,
    data: { titulo: 'Tipo de Contratación' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-tipo-contratacion/sc-tipo-contratacion.module').then(m => m.ScTipoContratacionModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class SelectionHiringRoutingModule { }
