import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { PlaNivelAcademicoComponent } from './pla-nivel-academico/pla-nivel-academico.component';
import { PlaTipoPuestoComponent } from './pla-tipo-puesto/pla-tipo-puesto.component';
import { PlaTipoDocumentoAdjuntoComponent } from './pla-tipo-documento-adjunto/pla-tipo-documento-adjunto.component';
import { PlaPuestoComponent } from './pla-puesto/pla-puesto.component';
import { PlaAfpComponent } from './pla-afp/pla-afp.component';
import { PlaSeguroSocialComponent } from './pla-seguro-social/pla-seguro-social.component';

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
    path: 'pla-tipo-documento-adjunto',
    component: PlaTipoDocumentoAdjuntoComponent,
    data: { titulo: 'Tipo Documento Adjunto' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./pla-tipo-documento-adjunto/pla-tipo-documento-adjunto.module').then(m => m.PlaTipoDocumentoAdjuntoModule)
  },
  {
    path: 'pla-puesto',
    component: PlaPuestoComponent,
    data: { titulo: 'Puesto' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./pla-puesto/pla-puesto.module').then(m => m.PlaPuestoModule)
  },
  {
    path: 'pla-afp',
    component: PlaAfpComponent,
    data: { titulo: 'AFP' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./pla-afp/pla-afp.module').then(m => m.PlaAfpModule)
  },
  {
    path: 'pla-seguro-social',
    component: PlaSeguroSocialComponent,
    data: { titulo: 'Seguro Social' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./pla-seguro-social/pla-seguro-social.module').then(m => m.PlaSeguroSocialModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrollRoutingModule { }
