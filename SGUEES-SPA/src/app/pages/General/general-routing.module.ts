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
import { GenActividadEconomicaComponent } from './gen-actividad-economica/gen-actividad-economica.component';
import { GenTipoContribuyenteComponent } from './gen-tipo-contribuyente/gen-tipo-contribuyente.component';
import { GenOrigenIngresoComponent } from './gen-origen-ingreso/gen-origen-ingreso.component';
import { GenReligionComponent } from './gen-religion/gen-religion.component';
import { GenTipoDocumentoIdentidadComponent } from './gen-tipo-documento-identidad/gen-tipo-documento-identidad.component';
import { GenParentescoComponent } from './gen-parentesco/gen-parentesco.component';
import { GenTipoContactoComponent } from './gen-tipo-contacto/gen-tipo-contacto.component';
import { GenEmpleadoComponent } from './gen-empleado/gen-empleado.component';

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
    data: { titulo: 'Asignación de Puestos a Unidades' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-unidades-puesto/gen-unidades-puesto.module').then(m => m.GenUnidadesPuestoModule)
  },
  {
    path: 'gen-actividad-economica',
    component: GenActividadEconomicaComponent,
    data: { titulo: 'Actividad Económica' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-actividad-economica/gen-actividad-economica.module').then(m => m.GenActividadEconomicaModule)
  },
  {
    path: 'gen-tipo-contribuyente',
    component: GenTipoContribuyenteComponent,
    data: { titulo: 'Tipo Contribuyente' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-tipo-contribuyente/gen-tipo-contribuyente.module').then(m => m.GenTipoContribuyenteModule)
  },
  {
    path: 'gen-origen-ingreso',
    component: GenOrigenIngresoComponent,
    data: { titulo: 'Origen Ingreso' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-origen-ingreso/gen-origen-ingreso.module').then(m => m.GenOrigenIngresoModule)
  },
  {
    path: 'gen-religion',
    component: GenReligionComponent,
    data: { titulo: 'Religión' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-religion/gen-religion.module').then(m => m.GenReligionModule)
  },
  {
    path: 'gen-tipo-documento-identidad',
    component: GenTipoDocumentoIdentidadComponent,
    data: { titulo: 'Tipo Documento Identidad' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-tipo-documento-identidad/gen-tipo-documento-identidad.module').then(m => m.GenTipoDocumentoIdentidadModule)
  },
  {
    path: 'gen-parentesco',
    component: GenParentescoComponent,
    data: { titulo: 'Parentesco' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-parentesco/gen-parentesco.module').then(m => m.GenParentescoModule)
  },
  {
    path: 'gen-tipo-contacto',
    component: GenTipoContactoComponent,
    data: { titulo: 'Tipo Contacto' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-tipo-contacto/gen-tipo-contacto.module').then(m => m.GenTipoContactoModule)
  },
  {
    path: 'gen-empleado',
    component: GenEmpleadoComponent,
    data: { titulo: 'Empleado' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./gen-empleado/gen-empleado.module').then(m => m.GenEmpleadoModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralRoutingModule { }
