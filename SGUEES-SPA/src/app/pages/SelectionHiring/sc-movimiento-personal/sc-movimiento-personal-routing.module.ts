import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';

import { ScMovimientoPersonalComponent } from './sc-movimiento-personal.component';

const routes: Routes = [{ path: '', component: ScMovimientoPersonalComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxFormModule,
		DxDataGridModule,
		DxButtonModule,
		DxLoadPanelModule,
		DxDropDownBoxModule,
		DxCheckBoxModule,
		DxDateBoxModule,
		DxPopupModule,
		DxTabPanelModule,
		DataGridMttoModule,
		BarraDataMttoModule,
		DataLookupModule,
	],
	exports: [RouterModule],
	declarations: [ScMovimientoPersonalComponent],
})
export class ScMovimientoPersonalRoutingModule {}
