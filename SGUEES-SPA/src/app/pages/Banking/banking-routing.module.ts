import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { BanLineaTrabajoConciliacionComponent } from './ban-linea-trabajo-conciliacion/ban-linea-trabajo-conciliacion.component';
import { BanTipoChequeComponent } from './ban-tipo-cheque/ban-tipo-cheque.component';
import { BanTipoMoviBancarioComponent } from './ban-tipo-movi-bancario/ban-tipo-movi-bancario.component';
import { BanCuentaBancariaComponent } from './ban-cuenta-bancaria/ban-cuenta-bancaria.component';
import { BanDocumentoComponent } from './ban-documento/ban-documento.component';

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
		data: { titulo: 'Documentos Bancarios', muestraCheques: false },
		canActivate: [AuthGuardService],
		canDeactivate: [AppCanDeactivateGuard],
		loadChildren: () => import('./ban-documento/ban-documento.module').then((m) => m.BanDocumentoModule),
	},
	{
		path: 'ban-cheque',
		component: BanDocumentoComponent,
		data: { titulo: 'Cheques', muestraCheques: true },
		canActivate: [AuthGuardService],
		canDeactivate: [AppCanDeactivateGuard],
		loadChildren: () => import('./ban-documento/ban-documento.module').then((m) => m.BanDocumentoModule),
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class BankingRoutingModule {}
