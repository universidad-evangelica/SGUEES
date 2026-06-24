import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';



import { AuthGuardService } from 'src/app/shared/services/auth.service';

import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';

import { ConAreaFuncionalComponent } from './con-area-funcional/con-area-funcional.component';

import { ConParametroComponent } from './con-parametro/con-parametro.component';

import { ConRubroComponent } from './con-rubro/con-rubro.component';

import { ConClasePartidaComponent } from './con-clase-partida/con-clase-partida.component';

import { ConPeriodoContableComponent } from './con-periodo-contable/con-periodo-contable.component';

import { ConCatalogoCuentaComponent } from './con-catalogo-cuenta/con-catalogo-cuenta.component';

import { ConCatalogoCuentaCentroCostoComponent } from './con-catalogo-cuenta-centro-costo/con-catalogo-cuenta-centro-costo.component';

import { ConContabilidadImportarExcelComponent } from './con-contabilidad-importar-excel/con-contabilidad-importar-excel.component';

import { ConCatalogoPresupuestoComponent } from './con-catalogo-presupuesto/con-catalogo-presupuesto.component';

import { ConPartidaComponent } from './con-partida/con-partida.component';

import { ConTipoCentroCostoComponent } from './con-tipo-centro-costo/con-tipo-centro-costo.component';

import { ConCentroCostoComponent } from './con-centro-costo/con-centro-costo.component';

import { ConDivisionComponent } from './con-division/con-division.component';

import { ConGerenciaComponent } from './con-gerencia/con-gerencia.component';

import { ConDepartamentoComponent } from './con-departamento/con-departamento.component';

import { ConSeccionComponent } from './con-seccion/con-seccion.component';

import { ConCierreAperturaComponent } from './con-cierre-apertura/con-cierre-apertura.component';

import { ConPartidaOperacionComponent } from './con-partida-operacion/con-partida-operacion.component';

import { ConPartidaModeloComponent } from './con-partida-modelo/con-partida-modelo.component';

import { ConPartidaModeloSeleccionComponent } from './con-partida-modelo-seleccion/con-partida-modelo-seleccion.component';

import { ConReporteComponent } from './con-reporte/con-reporte.component';

const reporteRoutes = [
	{ path: 'con-reporte-libro-diario-auxiliar', codigo: 'LIBRO_DIARIO_AUXILIAR', titulo: 'Libro Diario Auxiliar' },
	{ path: 'con-reporte-libro-diario-auxiliar-mes', codigo: 'LIBRO_DIARIO_AUXILIAR_MES', titulo: 'Libro Diario Auxiliar - Saldo Mes' },
	{ path: 'con-reporte-libro-diario-mayor', codigo: 'LIBRO_DIARIO_MAYOR', titulo: 'Libro Diario Mayor' },
	{ path: 'con-reporte-balance-comprobacion', codigo: 'BALANCE_COMPROBACION', titulo: 'Balance de Comprobacion' },
	{ path: 'con-reporte-balance-comprobacion-mes', codigo: 'BALANCE_COMPROBACION_MES', titulo: 'Balance de Comprobacion - Saldo Mes' },
	{ path: 'con-reporte-balance-general', codigo: 'BALANCE_GENERAL', titulo: 'Balance General' },
	{ path: 'con-reporte-estado-resultados', codigo: 'ESTADO_RESULTADOS', titulo: 'Estado de Resultados' },
	{ path: 'con-reporte-balance-general-vertical', codigo: 'BALANCE_GENERAL_VERTICAL', titulo: 'Balance General Vertical' },
];

const routes: Routes = [

  {

    path: 'con-area-funcional',

    component: ConAreaFuncionalComponent,

    data: { titulo: 'Configuración Área Funcional' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-area-funcional/con-area-funcional.module').then(m => m.ConAreaFuncionalModule)

  },

  {

    path: 'con-parametro',

    component: ConParametroComponent,

    data: { titulo: 'Parámetros Contabilidad' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-parametro/con-parametro.module').then(m => m.ConParametroModule)

  },

  {

    path: 'con-rubro',

    component: ConRubroComponent,

    data: { titulo: 'Rubros Contables' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-rubro/con-rubro.module').then(m => m.ConRubroModule)

  },

  {

    path: 'con-clase-partida',

    component: ConClasePartidaComponent,

    data: { titulo: 'Clases de Partida' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-clase-partida/con-clase-partida.module').then(m => m.ConClasePartidaModule)

  },

  {

    path: 'con-periodo-contable',

    component: ConPeriodoContableComponent,

    data: { titulo: 'Períodos Contables' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-periodo-contable/con-periodo-contable.module').then(m => m.ConPeriodoContableModule)

  },

  {

    path: 'con-catalogo-cuenta',

    component: ConCatalogoCuentaComponent,

    data: { titulo: 'Catálogo de Cuentas' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-catalogo-cuenta/con-catalogo-cuenta.module').then(m => m.ConCatalogoCuentaModule)

  },

  {

    path: 'con-catalogo-cuenta-centro-costo',

    component: ConCatalogoCuentaCentroCostoComponent,

    data: { titulo: 'Cuentas por Centro Costo' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-catalogo-cuenta-centro-costo/con-catalogo-cuenta-centro-costo.module').then(m => m.ConCatalogoCuentaCentroCostoModule)

  },

  {

    path: 'con-contabilidad-importar-excel',

    component: ConContabilidadImportarExcelComponent,

    data: { titulo: 'Importar catálogos contables' },

    canActivate: [ AuthGuardService ],

    loadChildren: () => import('./con-contabilidad-importar-excel/con-contabilidad-importar-excel.module').then(m => m.ConContabilidadImportarExcelModule)

  },

  {

    path: 'con-catalogo-presupuesto',

    component: ConCatalogoPresupuestoComponent,

    data: { titulo: 'Presupuestos' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-catalogo-presupuesto/con-catalogo-presupuesto.module').then(m => m.ConCatalogoPresupuestoModule)

  },

  {

    path: 'con-partida',

    component: ConPartidaComponent,

    data: { titulo: 'Partidas Contables' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-partida/con-partida.module').then(m => m.ConPartidaModule)

  },

  {

    path: 'con-partida-aplicar',

    component: ConPartidaOperacionComponent,

    data: { titulo: 'Partidas a Aplicar', modo: 'aplicar' },

    canActivate: [ AuthGuardService ],

    loadChildren: () => import('./con-partida-aplicar/con-partida-aplicar.module').then(m => m.ConPartidaAplicarModule)

  },

  {

    path: 'con-partida-desaplicar',

    component: ConPartidaOperacionComponent,

    data: { titulo: 'Partidas a Des-Aplicar', modo: 'desaplicar' },

    canActivate: [ AuthGuardService ],

    loadChildren: () => import('./con-partida-desaplicar/con-partida-desaplicar.module').then(m => m.ConPartidaDesAplicarModule)

  },

  {

    path: 'con-partida-anular',

    component: ConPartidaOperacionComponent,

    data: { titulo: 'Partidas a Anular', modo: 'anular' },

    canActivate: [ AuthGuardService ],

    loadChildren: () => import('./con-partida-anular/con-partida-anular.module').then(m => m.ConPartidaAnularModule)

  },

  {

    path: 'con-tipo-centro-costo',

    component: ConTipoCentroCostoComponent,

    data: { titulo: 'Tipos Centro Costo' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-tipo-centro-costo/con-tipo-centro-costo.module').then(m => m.ConTipoCentroCostoModule)

  },

  {

    path: 'con-centro-costo',

    component: ConCentroCostoComponent,

    data: { titulo: 'Centros de Costo' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-centro-costo/con-centro-costo.module').then(m => m.ConCentroCostoModule)

  },

  {

    path: 'con-division',

    component: ConDivisionComponent,

    data: { titulo: 'Divisiones' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-division/con-division.module').then(m => m.ConDivisionModule)

  },

  {

    path: 'con-gerencia',

    component: ConGerenciaComponent,

    data: { titulo: 'Gerencias' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-gerencia/con-gerencia.module').then(m => m.ConGerenciaModule)

  },

  {

    path: 'con-departamento',

    component: ConDepartamentoComponent,

    data: { titulo: 'Departamentos Contables' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-departamento/con-departamento.module').then(m => m.ConDepartamentoModule)

  },

  {

    path: 'con-seccion',

    component: ConSeccionComponent,

    data: { titulo: 'Secciones' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-seccion/con-seccion.module').then(m => m.ConSeccionModule)

  },

  {

    path: 'con-cierre-apertura',

    component: ConCierreAperturaComponent,

    data: { titulo: 'Cierre y Apertura de Periodos' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-cierre-apertura/con-cierre-apertura.module').then(m => m.ConCierreAperturaModule)

  },

  {

    path: 'con-partida-modelo',

    component: ConPartidaModeloComponent,

    data: { titulo: 'Partidas Modelo' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-partida-modelo/con-partida-modelo.module').then(m => m.ConPartidaModeloModule)

  },

  {

    path: 'con-partida-modelo-seleccion',

    component: ConPartidaModeloSeleccionComponent,

    data: { titulo: 'Generar Partida desde Modelo' },

    canActivate: [ AuthGuardService ],

    canDeactivate: [ AppCanDeactivateGuard ],

    loadChildren: () => import('./con-partida-modelo-seleccion/con-partida-modelo-seleccion.module').then(m => m.ConPartidaModeloSeleccionModule)

  },

  ...reporteRoutes.map((r) => ({
    path: r.path,
    component: ConReporteComponent,
    data: { titulo: r.titulo, codigo: r.codigo },
    canActivate: [ AuthGuardService ],
    loadChildren: () => import('./con-reporte/con-reporte.module').then(m => m.ConReporteModule),
  })),

];



@NgModule({

  imports: [RouterModule.forChild(routes)],

  exports: [RouterModule]

})

export class AccountingRoutingModule { }


