// Qué hace: rutas del módulo Académico.
// Cómo: publica Documentos por solicitud en /aca-documento-admision-flujo.
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { AcaDocumentoAdmisionFlujoComponent } from './aca-documento-admision-flujo/aca-documento-admision-flujo.component';

const routes: Routes = [
  {
    path: 'aca-documento-admision-flujo',
    component: AcaDocumentoAdmisionFlujoComponent,
    data: { titulo: 'Documentos por solicitud' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./aca-documento-admision-flujo/aca-documento-admision-flujo.module').then(m => m.AcaDocumentoAdmisionFlujoModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademicsRoutingModule { }
