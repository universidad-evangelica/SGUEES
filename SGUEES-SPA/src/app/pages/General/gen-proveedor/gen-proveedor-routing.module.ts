import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';

import { GenProveedorComponent } from './gen-proveedor.component';

const routes: Routes = [{ path: '', component: GenProveedorComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		FormsModule,
		DxFormModule,
		DxDataGridModule,
		DxLoadPanelModule,
		DxLoadIndicatorModule,
		DxButtonModule,
		DxTabPanelModule,
		DxDropDownBoxModule,
		DxCheckBoxModule,
		DxPopupModule,
		DxSelectBoxModule,
		DxTextBoxModule,
		DataGridMttoModule,
		DataLookupModule,
		BarraDataMttoModule,
	],
	exports: [RouterModule],
	declarations: [GenProveedorComponent],
})
export class GenProveedorRoutingModule {}
