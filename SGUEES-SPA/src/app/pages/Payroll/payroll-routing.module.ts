import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { PlaDepartamentoComponent } from './pla-departamento/pla-departamento.component';

const routes: Routes = [
  {
    path: 'pla-departamento',
    component: PlaDepartamentoComponent,
    data: { titulo: 'Departamento' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./pla-departamento/pla-departamento.module').then(m => m.PlaDepartamentoModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class PayrollRoutingModule { }
