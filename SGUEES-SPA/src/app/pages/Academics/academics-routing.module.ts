import { AcaAsignaturasComponent } from './aca-asignaturas/aca-asignaturas.component';
import { NgModule } from '@angular/core';
import { AcaCarrerasComponent } from './aca-carreras/aca-carreras.component';
import { AcaCiclosComponent } from './aca-periodos-academicos/ciclos/aca-ciclos.component';
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
import { AcaFacultadesComponent } from './aca-facultades/aca-facultades.component';
import { AcaProspectoComponent as AcaProspectoNuevoIngresoComponent } from './aca-prospecto-nuevo-ingreso/aca-prospecto.component';
import { AcaProspectoComponent as AcaProspectoSocioeconomicoComponent } from './aca-prospecto-socioeconomico/aca-prospecto.component';
import { AcaProspectoComponent as AcaProspectoBecaComponent } from './aca-prospecto-beca/aca-prospecto.component';
import { AcaDocumentoAdmisionFlujoTipoDocumentoComponent } from './aca-documento-admision-flujo-tipo-documento/aca-documento-admision-flujo-tipo-documento.component';

const routes: Routes = [
  { path: 'aca-tipos-practica', redirectTo: '/aca-asignaturas?catalogo=practicas', pathMatch: 'full' },
  {
    path: 'aca-asignaturas', component: AcaAsignaturasComponent,
    canActivate: [AuthGuardService], canDeactivate: [AppCanDeactivateGuard], data: { titulo: 'Asignaturas' },
    loadChildren: () => import('./aca-asignaturas/aca-asignaturas.module').then(m => m.AcaAsignaturasModule),
  },
  { path: 'aca-periodos-curso', redirectTo: '/aca-asignaturas?catalogo=periodos', pathMatch: 'full' },
  {
    path: 'aca-periodos-academicos', component: AcaCiclosComponent,
    canActivate: [AuthGuardService], canDeactivate: [AppCanDeactivateGuard], data: { titulo: 'Ciclos académicos por área' },
    loadChildren: () => import('./aca-periodos-academicos/aca-periodos-academicos.module').then(m => m.AcaPeriodosAcademicosModule),
  },
  {
    path: 'aca-carreras',
    component: AcaCarrerasComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Carreras' },
    loadChildren: () => import('./aca-carreras/aca-carreras.module').then(m => m.AcaCarrerasModule),
  },
  // Qué hace: abre Solicitud nuevo ingreso, Solicitud beca y Solicitud socioeconómica.
  // Cómo lo hace: cada pantalla usa su propia dirección, la misma que el menú y la política del API.
  {
    path: 'aca-prospecto-nuevo-ingreso',
    component: AcaProspectoNuevoIngresoComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Solicitud nuevo ingreso' },
    loadChildren: () => import('./aca-prospecto-nuevo-ingreso/aca-prospecto-nuevo-ingreso.module').then((m) => m.AcaProspectoNuevoIngresoModule),
  },
  {
    path: 'aca-prospecto-beca',
    component: AcaProspectoBecaComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Solicitud beca' },
    loadChildren: () => import('./aca-prospecto-beca/aca-prospecto-beca.module').then((m) => m.AcaProspectoBecaModule),
  },
  {
    path: 'aca-prospecto-socioeconomico',
    component: AcaProspectoSocioeconomicoComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Solicitud socioeconómica' },
    loadChildren: () => import('./aca-prospecto-socioeconomico/aca-prospecto-socioeconomico.module').then((m) => m.AcaProspectoSocioeconomicoModule),
  },
  // Qué hace: abre Documentos por solicitud.
  // Cómo lo hace: la dirección del menú es /aca-documento-admision-flujo-tipo-documento
  //               y carga el módulo que ya existía para esa pantalla.
  {
    path: 'aca-documento-admision-flujo-tipo-documento',
    component: AcaDocumentoAdmisionFlujoTipoDocumentoComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Documentos por solicitud' },
    loadChildren: () => import('./aca-documento-admision-flujo-tipo-documento/aca-documento-admision-flujo-tipo-documento.module').then((m) => m.AcaDocumentoAdmisionFlujoTipoDocumentoModule),
  },
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
  {
    path: 'aca-facultades',
    component: AcaFacultadesComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AppCanDeactivateGuard],
    data: { titulo: 'Facultades' },
    loadChildren: () => import('./aca-facultades/aca-facultades.module').then((m) => m.AcaFacultadesModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademicsRoutingModule { }
