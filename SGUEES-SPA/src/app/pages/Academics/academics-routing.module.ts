import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AcaProspectoComponent } from './aca-prospecto/aca-prospecto.component';

const routes: Routes = [
  {
    path: 'aca-prospecto',
    component: AcaProspectoComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Prospectos' },
    loadChildren: () => import('./aca-prospecto/aca-prospecto.module').then((m) => m.AcaProspectoModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademicsRoutingModule { }
