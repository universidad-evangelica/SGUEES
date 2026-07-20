import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';



import { AuthGuardService } from 'src/app/shared/services/auth.service';

import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';

import { BanLineaTrabajoConciliacionComponent } from './ban-linea-trabajo-conciliacion/ban-linea-trabajo-conciliacion.component';

import { BanTipoChequeComponent } from './ban-tipo-cheque/ban-tipo-cheque.component';

import { BanTipoMoviBancarioComponent } from './ban-tipo-movi-bancario/ban-tipo-movi-bancario.component';

import { BanCuentaBancariaComponent } from './ban-cuenta-bancaria/ban-cuenta-bancaria.component';

import { BanDocumentoComponent } from './ban-documento/ban-documento.component';

import { BanChequeComponent } from './ban-cheque/ban-cheque.component';

import { BanDocumentoProcesoComponent } from './ban-documento-proceso/ban-documento-proceso.component';
import { BanConciliaBancariaComponent } from './ban-concilia-bancaria/ban-concilia-bancaria.component';

import { BanChequeImprimirComponent } from './ban-cheque-imprimir/ban-cheque-imprimir.component';

import { BanParametroComponent } from './ban-parametro/ban-parametro.component';

import { BanSoliChequeComponent } from './ban-soli-cheque/ban-soli-cheque.component';

import { BanSoliChequeAutorizaComponent } from './ban-soli-cheque-autoriza/ban-soli-cheque-autoriza.component';

import { buildBanReporteRoutes } from './ban-reporte/ban-reporte.routes';

const routes: Routes = [

	{

		path: 'ban-linea-trabajo-conciliacion',

		component: BanLineaTrabajoConciliacionComponent,

		data: { titulo: 'Líneas Trabajo - Conciliación Bancaria' },

		canActivate: [AuthGuardService],

		canDeactivate: [AppCanDeactivateGuard],

		loadChildren: () =>

			import('./ban-linea-trabajo-conciliacion/ban-linea-trabajo-conciliacion.module').then(

				(m) => m.BanLineaTrabajoConciliacionModule

			),

	},

	{

		path: 'ban-tipo-cheque',

		component: BanTipoChequeComponent,

		data: { titulo: 'Tipos de Cheques' },

		canActivate: [AuthGuardService],

		canDeactivate: [AppCanDeactivateGuard],

		loadChildren: () => import('./ban-tipo-cheque/ban-tipo-cheque.module').then((m) => m.BanTipoChequeModule),

	},

	{

		path: 'ban-tipo-movi-bancario',

		component: BanTipoMoviBancarioComponent,

		data: { titulo: 'Tipos de Movimientos Bancarios' },

		canActivate: [AuthGuardService],

		canDeactivate: [AppCanDeactivateGuard],

		loadChildren: () =>

			import('./ban-tipo-movi-bancario/ban-tipo-movi-bancario.module').then((m) => m.BanTipoMoviBancarioModule),

	},

	{

		path: 'ban-cuenta-bancaria',

		component: BanCuentaBancariaComponent,

		data: { titulo: 'Cuentas Bancarias' },

		canActivate: [AuthGuardService],

		canDeactivate: [AppCanDeactivateGuard],

		loadChildren: () =>

			import('./ban-cuenta-bancaria/ban-cuenta-bancaria.module').then((m) => m.BanCuentaBancariaModule),

	},

	{

		path: 'ban-documento',

		component: BanDocumentoComponent,

		data: { titulo: 'Documentos Bancarios' },

		canActivate: [AuthGuardService],

		canDeactivate: [AppCanDeactivateGuard],

		loadChildren: () => import('./ban-documento/ban-documento.module').then((m) => m.BanDocumentoModule),

	},

	{

		path: 'ban-cheque',

		component: BanChequeComponent,

		data: { titulo: 'Cheques' },

		canActivate: [AuthGuardService],

		canDeactivate: [AppCanDeactivateGuard],

		loadChildren: () => import('./ban-cheque/ban-cheque.module').then((m) => m.BanChequeModule),

	},

	{

		path: 'ban-parametro',

		component: BanParametroComponent,

		data: { titulo: 'Parámetros Bancarios' },

		canActivate: [AuthGuardService],

		canDeactivate: [AppCanDeactivateGuard],

		loadChildren: () => import('./ban-parametro/ban-parametro.module').then((m) => m.BanParametroModule),

	},

	{

		path: 'ban-soli-cheque',

		component: BanSoliChequeComponent,

		data: { titulo: 'Solicitud de Cheques' },

		canActivate: [AuthGuardService],

		canDeactivate: [AppCanDeactivateGuard],

		loadChildren: () => import('./ban-soli-cheque/ban-soli-cheque.module').then((m) => m.BanSoliChequeModule),

	},

	{

		path: 'ban-soli-cheque-autoriza',

		component: BanSoliChequeAutorizaComponent,

		data: { titulo: 'Autorizar Solicitud de Cheques' },

		canActivate: [AuthGuardService],

		loadChildren: () =>

			import('./ban-soli-cheque-autoriza/ban-soli-cheque-autoriza.module').then((m) => m.BanSoliChequeAutorizaModule),

	},

	{

		path: 'ban-documento-aplicar',

		component: BanDocumentoProcesoComponent,

		data: { titulo: 'Documentos Bancarios a Aplicar', modo: 'documento-aplicar' },

		canActivate: [AuthGuardService],

		loadChildren: () =>

			import('./ban-documento-aplicar/ban-documento-aplicar.module').then((m) => m.BanDocumentoAplicarModule),

	},

	{

		path: 'ban-cheque-aplicar',

		component: BanDocumentoProcesoComponent,

		data: { titulo: 'Cheques a Aplicar', modo: 'cheque-aplicar' },

		canActivate: [AuthGuardService],

		loadChildren: () =>

			import('./ban-cheque-aplicar/ban-cheque-aplicar.module').then((m) => m.BanChequeAplicarModule),

	},

	{

		path: 'ban-cheque-imprimir',

		component: BanChequeImprimirComponent,

		data: { titulo: 'Cheques a Imprimir' },

		canActivate: [AuthGuardService],

		loadChildren: () =>

			import('./ban-cheque-imprimir/ban-cheque-imprimir.module').then((m) => m.BanChequeImprimirModule),

	},

	{

		path: 'ban-documento-anular',

		component: BanDocumentoProcesoComponent,

		data: { titulo: 'Documentos Bancarios a Anular', modo: 'documento-anular' },

		canActivate: [AuthGuardService],

		loadChildren: () =>

			import('./ban-documento-anular/ban-documento-anular.module').then((m) => m.BanDocumentoAnularModule),

	},

	{

		path: 'ban-documento-contabilizar',

		component: BanDocumentoProcesoComponent,

		data: { titulo: 'Contabilizar Documentos Bancarios', modo: 'documento-contabilizar' },

		canActivate: [AuthGuardService],

		loadChildren: () =>

			import('./ban-documento-contabilizar/ban-documento-contabilizar.module').then(

				(m) => m.BanDocumentoContabilizarModule

			),

	},

	{

		path: 'ban-concilia-bancaria',

		component: BanConciliaBancariaComponent,

		data: { titulo: 'Conciliación Bancaria' },

		canActivate: [AuthGuardService],

		canDeactivate: [AppCanDeactivateGuard],

		loadChildren: () =>

			import('./ban-concilia-bancaria/ban-concilia-bancaria.module').then((m) => m.BanConciliaBancariaModule),

	},

	{

		path: 'ban-cheque-anular',

		component: BanDocumentoProcesoComponent,

		data: { titulo: 'Cheques a Anular', modo: 'cheque-anular' },

		canActivate: [AuthGuardService],

		loadChildren: () =>

			import('./ban-cheque-anular/ban-cheque-anular.module').then((m) => m.BanChequeAnularModule),

	},

	...buildBanReporteRoutes([AuthGuardService]),

];



@NgModule({

	imports: [RouterModule.forChild(routes)],

	exports: [RouterModule],

})

export class BankingRoutingModule {}


