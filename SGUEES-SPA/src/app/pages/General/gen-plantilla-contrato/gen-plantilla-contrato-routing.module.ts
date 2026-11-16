// Qué hace: routing y dependencias UI de la vista Plantillas de Contratos.
// Cómo lo hace: declara GenPlantillaContratoComponent e importa los módulos DevExtreme y de layout necesarios.
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxDropDownButtonModule } from 'devextreme-angular/ui/drop-down-button';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxHtmlEditorModule } from 'devextreme-angular/ui/html-editor';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { GenPlantillaContratoComponent } from './gen-plantilla-contrato.component';

const routes: Routes = [{ path: '', component: GenPlantillaContratoComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxButtonModule,
		DxDataGridModule,
		DxDropDownButtonModule,
		DxFormModule,
		DxHtmlEditorModule,
		DxLoadPanelModule,
		DxPopupModule,
		DxSelectBoxModule,
		DxTabPanelModule,
		DxTextAreaModule,
		DxTextBoxModule,
		BarraDataMttoModule,
		DataGridMttoModule,
		DataLookupModule,
	],
	exports: [RouterModule],
	declarations: [GenPlantillaContratoComponent],
})
export class GenPlantillaContratoRoutingModule {}

