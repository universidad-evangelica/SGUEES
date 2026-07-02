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

import { ConReporteComponent } from './con-reporte.component';

const routes: Routes = [{ path: '', component: ConReporteComponent }];

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
	],
	exports: [RouterModule],
	declarations: [ConReporteComponent],
})
export class ConReporteRoutingModule {}
