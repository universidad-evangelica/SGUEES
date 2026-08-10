// Qué hace: routing y declaraciones DevExtreme/layout de la vista Puesto.
// Cómo: define la ruta lazy, importa form/grilla/lookup y declara el componente.
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { ToastModule } from 'primeng/toast';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { PlaPuestoComponent } from './pla-puesto.component';

const routes: Routes = [{ path: '', component: PlaPuestoComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxButtonModule,
		DxCheckBoxModule,
		DxFormModule,
		DxLoadPanelModule,
		DxNumberBoxModule,
		DxSelectBoxModule,
		DxTextAreaModule,
		DxTextBoxModule,
		DxTooltipModule,
		BarraDataMttoModule,
		DataGridMttoModule,
		DataLookupModule,
		ToastModule,
	],
	exports: [RouterModule],
	declarations: [PlaPuestoComponent],
})
export class PlaPuestoRoutingModule {}
