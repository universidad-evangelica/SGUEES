import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { ScTipoVacanteComponent } from './sc-tipo-vacante/sc-tipo-vacante.component';
import { ScRequisicionPersonalComponent } from './sc-requisicion-personal/sc-requisicion-personal.component';
import { ScTipoModalidadComponent } from './sc-tipo-modalidad/sc-tipo-modalidad.component';
import { ScTipoContratacionComponent } from './sc-tipo-contratacion/sc-tipo-contratacion.component';
import { ScResponsabilidadCargoComponent } from './sc-responsabilidad-cargo/sc-responsabilidad-cargo.component';
import { ScRiesgoPuestoComponent } from './sc-riesgo-puesto/sc-riesgo-puesto.component';
import { ScInduccionComponent } from './sc-induccion/sc-induccion.component';
import { ScFrecuenciaComponent } from './sc-frecuencia/sc-frecuencia.component';
import { ScRequerimientoOrganizacionalComponent } from './sc-requerimiento-organizacional/sc-requerimiento-organizacional.component';
import { ScDisponibilidadHorarioComponent } from './sc-disponibilidad-horario/sc-disponibilidad-horario.component';
import { ScImpactoEconomicoComponent } from './sc-impacto-economico/sc-impacto-economico.component';
import { ScCompetenciasTecnicasComponent } from './sc-competencias-tecnicas/sc-competencias-tecnicas.component';
import { SC_OrganigramaEstructuralUnidadesComponent } from './sc-organigrama-estructural-unidades/sc-organigrama-estructural-unidades.component';
import { SC_OrganigramaEstructuralNivelComponent } from './sc-organigrama-estructural-nivel/sc-organigrama-estructural-nivel.component';
import { ScRequisicionObservadoresComponent } from './sc-requisicion-observadores/sc-requisicion-observadores.component';
import { ScCompetenciasConductualesComponent } from './sc-competencias-conductuales/sc-competencias-conductuales.component';
import { ScDescriptorPuestoComponent } from './sc-descriptor-puesto/sc-descriptor-puesto.component';
import { ScUnidadesUsuarioComponent } from './sc-unidades-usuario/sc-unidades-usuario.component';
import { ScSolicitudEmpleoComponent } from './sc-solicitud-empleo/sc-solicitud-empleo.component';


const routes: Routes = [
  {
    path: 'sc-tipo-vacante',
    component: ScTipoVacanteComponent,
    data: { titulo: 'Tipo de Vacante' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-tipo-vacante/sc-tipo-vacante.module').then(m => m.ScTipoVacanteModule)
  },
  {
    path: 'sc-requisicion-personal',
    component: ScRequisicionPersonalComponent,
    data: { titulo: 'Requisicion de personal' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-requisicion-personal/sc-requisicion-personal.module').then(m => m.ScRequisicionPersonalModule)
  },
  {
    path: 'sc-requisicion-observadores',
    component: ScRequisicionObservadoresComponent,
    data: { titulo: 'Requisicion Observadores' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-requisicion-observadores/sc-requisicion-observadores.module').then(m => m.ScRequisicionObservadoresModule)
  },
  {
    path: 'sc-tipo-modalidad',
    component: ScTipoModalidadComponent,
    data: { titulo: 'Tipo de modalidad' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-tipo-modalidad/sc-tipo-modalidad.module').then(m => m.ScTipoModalidadModule)
  }
  ,{
    path: 'sc-tipo-contratacion',
    component: ScTipoContratacionComponent,
    data: { titulo: 'Tipo de Contratación' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-tipo-contratacion/sc-tipo-contratacion.module').then(m => m.ScTipoContratacionModule)
  },
  {
    path: 'sc-responsabilidad-cargo',
    component: ScResponsabilidadCargoComponent,
    data: { titulo: 'Responsabilidad de Cargo' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-responsabilidad-cargo/sc-responsabilidad-cargo.module').then(m => m.ScResponsabilidadCargoModule)
  },
  {
    path: 'sc-riesgo-puesto',
    component: ScRiesgoPuestoComponent,
    data: { titulo: 'Riesgo de Puesto' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-riesgo-puesto/sc-riesgo-puesto.module').then(m => m.ScRiesgoPuestoModule)
  },
  {
    path: 'sc-induccion',
    component: ScInduccionComponent,
    data: { titulo: 'Inducción' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-induccion/sc-induccion.module').then(m => m.ScInduccionModule)
  },
  {
    path: 'sc-frecuencia',
    component: ScFrecuenciaComponent,
    data: { titulo: 'Frecuencia' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-frecuencia/sc-frecuencia.module').then(m => m.ScFrecuenciaModule)
  },
  {
    path: 'sc-requerimiento-organizacional',
    component: ScRequerimientoOrganizacionalComponent,
    data: { titulo: 'Requerimiento Organizacional' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-requerimiento-organizacional/sc-requerimiento-organizacional.module').then(m => m.ScRequerimientoOrganizacionalModule)
  },
  {
    path: 'sc-disponibilidad-horario',
    component: ScDisponibilidadHorarioComponent,
    data: { titulo: 'Disponibilidad de Horario' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-disponibilidad-horario/sc-disponibilidad-horario.module').then(m => m.ScDisponibilidadHorarioModule)
  },
  {
    path: 'sc-impacto-economico',
    component: ScImpactoEconomicoComponent,
    data: { titulo: 'Impacto Economico' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-impacto-economico/sc-impacto-economico.module').then(m => m.ScImpactoEconomicoModule)
  },
  {
    path: 'sc-competencias-tecnicas',
    component: ScCompetenciasTecnicasComponent,
    data: { titulo: 'Competencias Tecnicas' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-competencias-tecnicas/sc-competencias-tecnicas.module').then(m => m.ScCompetenciasTecnicasModule)
  },
  {
    path: 'sc-organigrama-estructural-unidades',
    component: SC_OrganigramaEstructuralUnidadesComponent,
    data: { titulo: 'Organigrama institucional' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-organigrama-estructural-unidades/sc-organigrama-estructural-unidades.module').then(m => m.SC_OrganigramaEstructuralUnidadesModule)
  },
  {
    path: 'sc-organigrama-estructural-nivel',
    component: SC_OrganigramaEstructuralNivelComponent,
    data: { titulo: 'Niveles del Organigrama' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-organigrama-estructural-nivel/sc-organigrama-estructural-nivel.module').then(m => m.SC_OrganigramaEstructuralNivelModule)
  },
  {
    path: 'sc-competencias-conductuales',
    component: ScCompetenciasConductualesComponent,
    data: { titulo: 'Competencias Conductuales' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-competencias-conductuales/sc-competencias-conductuales.module').then(m => m.ScCompetenciasConductualesModule)
  },
  {
    path: 'sc-descriptor-puesto',
    component: ScDescriptorPuestoComponent,
    data: { titulo: 'Descriptor de Puesto' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-descriptor-puesto/sc-descriptor-puesto.module').then(m => m.ScDescriptorPuestoModule)
  },
  {
    path: 'sc-unidades-usuario',
    component: ScUnidadesUsuarioComponent,
    data: { titulo: 'Unidades de Usuario' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-unidades-usuario/sc-unidades-usuario.module').then(m => m.ScUnidadesUsuarioModule)
  },
  {
    path: 'sc-solicitud-empleo',
    component: ScSolicitudEmpleoComponent,
    data: { titulo: 'Solicitud de Empleo' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./sc-solicitud-empleo/sc-solicitud-empleo.module').then(m => m.ScSolicitudEmpleoModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SelectionHiringRoutingModule { }
