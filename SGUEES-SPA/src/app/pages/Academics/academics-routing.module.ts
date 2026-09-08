import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AcaBecOrigenBecaComponent } from './aca-bec-origen-beca/aca-bec-origen-beca.component';
import { AcaBecDocumentoRequeridoComponent } from './aca-bec-documento-requerido/aca-bec-documento-requerido.component';
import { AcaBecConvenioComponent } from './aca-bec-convenio/aca-bec-convenio.component';
import { AcaBecEntidadFinanciadoraComponent } from './aca-bec-entidad-financiadora/aca-bec-entidad-financiadora.component';
import { AcaBecFinanciadorComponent } from './aca-bec-financiador/aca-bec-financiador.component';
import { AcaBecRequisitoComponent } from './aca-bec-requisito/aca-bec-requisito.component';
import { AcaBecTipoComponent } from './aca-bec-tipo/aca-bec-tipo.component';

const routes: Routes = [
  {
    path: 'aca-bec-origen-beca',
    component: AcaBecOrigenBecaComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Origen de Beca' },
    loadChildren: () => import('./aca-bec-origen-beca/aca-bec-origen-beca.module').then((m) => m.AcaBecOrigenBecaModule),
  },
  {
    path: 'aca-bec-tipo',
    component: AcaBecTipoComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Tipos de Beca' },
    loadChildren: () => import('./aca-bec-tipo/aca-bec-tipo.module').then((m) => m.AcaBecTipoModule),
  },
  {
    path: 'aca-bec-requisito',
    component: AcaBecRequisitoComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Requisitos de Beca' },
    loadChildren: () => import('./aca-bec-requisito/aca-bec-requisito.module').then((m) => m.AcaBecRequisitoModule),
  },
  {
    path: 'aca-bec-documento-requerido',
    component: AcaBecDocumentoRequeridoComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Documentos Requeridos' },
    loadChildren: () => import('./aca-bec-documento-requerido/aca-bec-documento-requerido.module').then((m) => m.AcaBecDocumentoRequeridoModule),
  },
  {
    path: 'aca-bec-convenio',
    component: AcaBecConvenioComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Convenios' },
    loadChildren: () => import('./aca-bec-convenio/aca-bec-convenio.module').then((m) => m.AcaBecConvenioModule),
  },
  {
    path: 'aca-bec-financiador',
    component: AcaBecFinanciadorComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Financiadores' },
    loadChildren: () => import('./aca-bec-financiador/aca-bec-financiador.module').then((m) => m.AcaBecFinanciadorModule),
  },
  {
    path: 'aca-bec-entidad-financiadora',
    component: AcaBecEntidadFinanciadoraComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Entidades Financiadoras' },
    loadChildren: () => import('./aca-bec-entidad-financiadora/aca-bec-entidad-financiadora.module').then((m) => m.AcaBecEntidadFinanciadoraModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademicsRoutingModule { }
