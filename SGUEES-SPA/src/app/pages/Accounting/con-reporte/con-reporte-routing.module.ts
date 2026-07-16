import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxBoxModule } from 'devextreme-angular/ui/box';
import { DxDrawerModule } from 'devextreme-angular/ui/drawer';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';

import { ConReporteShellComponent } from './shell/con-reporte-shell.component';
import { ConReporteLibroDiarioAuxiliarComponent } from './libro-diario-auxiliar/con-reporte-libro-diario-auxiliar.component';
import { ConReporteLibroDiarioAuxiliarMesComponent } from './libro-diario-auxiliar-mes/con-reporte-libro-diario-auxiliar-mes.component';
import { ConReporteLibroDiarioMayorComponent } from './libro-diario-mayor/con-reporte-libro-diario-mayor.component';
import { ConReporteBalanceComprobacionComponent } from './balance-comprobacion/con-reporte-balance-comprobacion.component';
import { ConReporteBalanceComprobacionMesComponent } from './balance-comprobacion-mes/con-reporte-balance-comprobacion-mes.component';
import { ConReporteBalanceGeneralComponent } from './balance-general/con-reporte-balance-general.component';
import { ConReporteEstadoResultadosComponent } from './estado-resultados/con-reporte-estado-resultados.component';
import { ConReporteBalanceGeneralVerticalComponent } from './balance-general-vertical/con-reporte-balance-general-vertical.component';

const routes: Routes = [];

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
		DxCheckBoxModule,
		DxBoxModule,
		DxDrawerModule,
		DxToolbarModule,
	],
	exports: [
		RouterModule,
		ConReporteShellComponent,
		ConReporteLibroDiarioAuxiliarComponent,
		ConReporteLibroDiarioAuxiliarMesComponent,
		ConReporteLibroDiarioMayorComponent,
		ConReporteBalanceComprobacionComponent,
		ConReporteBalanceComprobacionMesComponent,
		ConReporteBalanceGeneralComponent,
		ConReporteEstadoResultadosComponent,
		ConReporteBalanceGeneralVerticalComponent,
	],
	declarations: [
		ConReporteShellComponent,
		ConReporteLibroDiarioAuxiliarComponent,
		ConReporteLibroDiarioAuxiliarMesComponent,
		ConReporteLibroDiarioMayorComponent,
		ConReporteBalanceComprobacionComponent,
		ConReporteBalanceComprobacionMesComponent,
		ConReporteBalanceGeneralComponent,
		ConReporteEstadoResultadosComponent,
		ConReporteBalanceGeneralVerticalComponent,
	],
})
export class ConReporteRoutingModule {}
