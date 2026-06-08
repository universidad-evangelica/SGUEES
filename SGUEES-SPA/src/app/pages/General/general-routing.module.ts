import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { GenRubroComponent } from './gen-rubro/gen-rubro.component';
import { GenTipoGastoComponent } from './gen-tipo-gasto/gen-tipo-gasto.component';
import { GenTipoDocumentoComponent } from './gen-tipo-documento/gen-tipo-documento.component';
import { GenPaisComponent } from './gen-pais/gen-pais.component';
import { GenDeptoComponent } from './gen-depto/gen-depto.component';
import { GenMunicipioComponent } from './gen-municipio/gen-municipio.component';
import { GenDistritoComponent } from './gen-distrito/gen-distrito.component';
import { GenSectorEconomicoComponent } from './gen-sector-economico/gen-sector-economico.component';
import { GenEmpresaComponent } from './gen-empresa/gen-empresa.component';

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
  },
  {
    path:'gen-depto',
    component: GenDeptoComponent,
    data: { titulo: 'Departamentos' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-depto/gen-depto.module').then(m => m.GenDeptoModule)
  },
   {
    path:'gen-municipio',
    component: GenMunicipioComponent,
    data: { titulo: 'municipios' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-municipio/gen-municipio.module').then(m => m.GenMunicipioModule)
  },
  {
    path:'gen-distrito',
    component: GenDistritoComponent,
    data: { titulo: 'Distritos' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-distrito/gen-distrito.module').then(m => m.GenDistritoModule)
  },
  {
    path:'gen-sector-economico',
    component: GenSectorEconomicoComponent,
    data: { titulo: 'Sector Economicos' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-sector-economico/gen-sector-economico.module').then(m => m.GenSectorEconomicoModule)
  },
   {
    path:'gen-empresa',
    component: GenEmpresaComponent,
    data: { titulo: 'Empresas' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-empresa/gen-empresa.module').then(m => m.GenEmpresaModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralRoutingModule { }
