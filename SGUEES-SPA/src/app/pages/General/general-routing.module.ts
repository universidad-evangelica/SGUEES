import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { GenRubroComponent } from './gen-rubro/gen-rubro.component';
import { GenTipoGastoComponent } from './gen-tipo-gasto/gen-tipo-gasto.component';
import { GenTipoDocumentoComponent } from './gen-tipo-documento/gen-tipo-documento.component';
import { GenSectorEconomicoComponent } from './gen-sector-economico/gen-sector-economico.component';
import { GenEmpresaComponent } from './gen-empresa/gen-empresa.component';
import { GenEstructuraTerritorialComponent } from './gen-estructura-territorial/gen-estructura-territorial.component';
import { GenDivisionComponent } from './gen-division/gen-division.component';
import { GenGerenciaComponent } from './gen-gerencia/gen-gerencia.component';
import { GenBancoComponent } from './gen-banco/gen-banco.component';
import { GenUnidadesPuestoComponent } from './gen-unidades-puesto/gen-unidades-puesto.component';

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
  },
  {
    path: 'gen-estructura-territorial',
    component: GenEstructuraTerritorialComponent,
    data: { titulo: 'Estructura Territorial' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-estructura-territorial/gen-estructura-territorial.module').then(m => m.GenEstructuraTerritorialModule)
  },
  {
    path: 'gen-division',
    component: GenDivisionComponent,
    data: { titulo: 'Divisiones' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-division/gen-division.module').then(m => m.GenDivisionModule)
  },
  {
    path: 'gen-gerencia',
    component: GenGerenciaComponent,
    data: { titulo: 'Gerencias' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-gerencia/gen-gerencia.module').then(m => m.GenGerenciaModule)
  },
  {
    path: 'gen-banco',
    component: GenBancoComponent,
    data: { titulo: 'Bancos' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-banco/gen-banco.module').then(m => m.GenBancoModule)
  },
  {
    path: 'gen-unidades-puesto',
    component: GenUnidadesPuestoComponent,
    data: { titulo: 'Puestos por Unidad' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-unidades-puesto/gen-unidades-puesto.module').then(m => m.GenUnidadesPuestoModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralRoutingModule { }
