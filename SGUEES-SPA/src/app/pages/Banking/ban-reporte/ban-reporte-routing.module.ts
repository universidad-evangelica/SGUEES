import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxBoxModule } from 'devextreme-angular/ui/box';
import { DxDrawerModule } from 'devextreme-angular/ui/drawer';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';

import { BanReporteShellComponent } from './shell/ban-reporte-shell.component';
import { BanReporteChequeEmitidosComponent } from './reports/cheque-emitidos/ban-reporte-cheque-emitidos.component';
import { BanReporteEstadoCuentaComponent } from './reports/estado-cuenta/ban-reporte-estado-cuenta.component';
import { BanReporteEstadoCuentaAcumuladoComponent } from './reports/estado-cuenta-acumulado/ban-reporte-estado-cuenta-acumulado.component';
import { BanReporteEntregaChequesComponent } from './reports/entrega-cheques/ban-reporte-entrega-cheques.component';
import { buildBanReporteRoutes } from './ban-reporte.routes';

const routes = buildBanReporteRoutes([]);

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxDataGridModule,
		DxLoadPanelModule,
		DxButtonModule,
		DxDateBoxModule,
		DxSelectBoxModule,
		DxNumberBoxModule,
		DxBoxModule,
		DxDrawerModule,
		DxToolbarModule,
	],
	exports: [
		RouterModule,
		BanReporteShellComponent,
		BanReporteChequeEmitidosComponent,
		BanReporteEstadoCuentaComponent,
		BanReporteEstadoCuentaAcumuladoComponent,
		BanReporteEntregaChequesComponent,
	],
	declarations: [
		BanReporteShellComponent,
		BanReporteChequeEmitidosComponent,
		BanReporteEstadoCuentaComponent,
		BanReporteEstadoCuentaAcumuladoComponent,
		BanReporteEntregaChequesComponent,
	],
})
export class BanReporteRoutingModule {}
