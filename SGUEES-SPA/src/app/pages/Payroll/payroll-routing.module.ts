import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { PayrollHomeComponent } from './payroll-home/payroll-home.component';

const routes: Routes = [
  {
    path: 'payroll-home',
    component: PayrollHomeComponent,
    data: { titulo: 'Payroll' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./payroll-home/payroll-home.module').then(m => m.PayrollHomeModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class PayrollRoutingModule { }
