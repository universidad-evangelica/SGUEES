import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AcaBecOrigenBecaComponent } from './aca-bec-origen-beca/aca-bec-origen-beca.component';

const routes: Routes = [
  {
    path: 'aca-bec-origen-beca',
    component: AcaBecOrigenBecaComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Origen de Beca' },
    loadChildren: () => import('./aca-bec-origen-beca/aca-bec-origen-beca.module').then((m) => m.AcaBecOrigenBecaModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademicsRoutingModule { }
