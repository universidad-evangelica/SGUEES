import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { ScTipoVacanteComponent } from './sc-tipo-vacante/sc-tipo-vacante.component';
import { ScRequisicionPersonalComponent } from './sc-requisicion-personal/sc-requisicion-personal.component';

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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class SelectionHiringRoutingModule { }
