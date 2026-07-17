import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { ScDescriptorPuestoComponent } from './sc-descriptor-puesto.component';

// Ruta lazy del mantenimiento: path vacío porque el padre ya define el segmento.
const routes: Routes = [{ path: '', component: ScDescriptorPuestoComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		// Controles DevExtreme usados en encabezado, grids de detalle y popup de actividades.
		DxButtonModule,
		DxDataGridModule,
		DxDateBoxModule,
		DxFormModule,
		DxLoadPanelModule,
		DxNumberBoxModule,
		DxPopupModule,
		DxSelectBoxModule,
		DxTabPanelModule,
		DxTextAreaModule,
		DxTextBoxModule,
		// Layouts compartidos del patrón mtto (barra, grid browse, lookups).
		BarraDataMttoModule,
		DataGridMttoModule,
		DataLookupModule,
	],
	exports: [RouterModule],
	declarations: [ScDescriptorPuestoComponent],
})
export class ScDescriptorPuestoRoutingModule {}
