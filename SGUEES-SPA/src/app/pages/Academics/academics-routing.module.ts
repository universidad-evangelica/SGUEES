// Qué hace: rutas del módulo Académico.
// Cómo: publica Documentos por solicitud en /aca-documento-admision-flujo-tipo-documento.
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { AcaDocumentoAdmisionFlujoTipoDocumentoComponent } from './aca-documento-admision-flujo-tipo-documento/aca-documento-admision-flujo-tipo-documento.component';

const routes: Routes = [
  {
    path: 'aca-documento-admision-flujo-tipo-documento',
    component: AcaDocumentoAdmisionFlujoTipoDocumentoComponent,
    data: { titulo: 'Documentos por solicitud' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./aca-documento-admision-flujo-tipo-documento/aca-documento-admision-flujo-tipo-documento.module').then(m => m.AcaDocumentoAdmisionFlujoTipoDocumentoModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademicsRoutingModule { }
