import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { ConAreaFuncionalComponent } from './con-area-funcional/con-area-funcional.component';

const routes: Routes = [
  {
    path: 'con-area-funcional',
    component: ConAreaFuncionalComponent,
    data: { titulo: 'Configuración Área Funcional' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./con-area-funcional/con-area-funcional.module').then(m => m.ConAreaFuncionalModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountingRoutingModule { }
