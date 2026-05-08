import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { GenRubroComponent } from './gen-rubro/gen-rubro.component';
import { GenTipoGastoComponent } from './gen-tipo-gasto/gen-tipo-gasto.component';
import { GenTipoDocumentoComponent } from './gen-tipo-documento/gen-tipo-documento.component';
import { GenPaisComponent } from './gen-pais/gen-pais.component';

const routes: Routes = [
  {
    path: 'gen-rubro',
    component: GenRubroComponent,
    data: { titulo: 'Rubro' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-rubro/gen-rubro.module').then(m => m.GenRubroModule)
  },
  {
    path: 'gen-tipo-gasto',
    component: GenTipoGastoComponent,
    data: { titulo: 'Tipo Gasto' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-tipo-gasto/gen-tipo-gasto.module').then(m => m.GenTipoGastoModule)
  },
  {
    path:'gen-tipo-documento',
    component: GenTipoDocumentoComponent,
    data: { titulo: 'Tipo Documento' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-tipo-documento/gen-tipo-documento.module').then(m => m.GenTipoDocumentoModule)
  },
  {
    path:'gen-pais',
    component: GenPaisComponent,
    data: { titulo: 'Paises' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-pais/gen-pais.module').then(m => m.GenPaisModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class GeneralRoutingModule { }
