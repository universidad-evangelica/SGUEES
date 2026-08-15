import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { PlaNivelAcademicoComponent } from './pla-nivel-academico/pla-nivel-academico.component';
import { PlaTipoPuestoComponent } from './pla-tipo-puesto/pla-tipo-puesto.component';
import { PlaPuestoComponent } from './pla-puesto/pla-puesto.component';

const routes: Routes = [
  {
    path: 'pla-nivel-academico',
    component: PlaNivelAcademicoComponent,
    data: { titulo: 'Nivel Academico' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./pla-nivel-academico/pla-nivel-academico.module').then(m => m.PlaNivelAcademicoModule)
  },
  {
    path: 'pla-tipo-puesto',
    component: PlaTipoPuestoComponent,
    data: { titulo: 'Tipo de Puesto' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./pla-tipo-puesto/pla-tipo-puesto.module').then(m => m.PlaTipoPuestoModule)
  },
  {
    path: 'pla-puesto',
    component: PlaPuestoComponent,
    data: { titulo: 'Puesto' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./pla-puesto/pla-puesto.module').then(m => m.PlaPuestoModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrollRoutingModule { }
