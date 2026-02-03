import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { ScTipoVacanteComponent } from './sc-tipo-vacante/sc-tipo-vacante.component';

const routes: Routes = [
  {
    path: 'sc-tipo-vacante',
    component: ScTipoVacanteComponent,
    data: { titulo: 'Tipo de Vacante' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-tipo-vacante/sc-tipo-vacante.module').then(m => m.ScTipoVacanteModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class SelectionHiringRoutingModule { }
