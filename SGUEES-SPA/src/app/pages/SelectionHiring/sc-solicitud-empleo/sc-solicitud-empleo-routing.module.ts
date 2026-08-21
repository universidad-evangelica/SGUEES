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
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';

import { ScSolicitudEmpleoComponent } from './sc-solicitud-empleo.component';
import { ScSolicitudEmpleoEditarPersonaComponent } from './sc-solicitud-empleo-editar-persona.component';
import { ToastModule } from 'primeng/toast';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';
import { ToastModule } from "primeng/toast"; //importar el modulo de Toast para primeNG
import { DxToolbarModule } from "devextreme-angular/ui/toolbar";
import { DxPopupModule } from 'devextreme-angular/ui/popup';

const routes: Routes = [{ path: '', component: ScSolicitudEmpleoComponent }];

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
		DxTabPanelModule,
		DxTextBoxModule,
		DxDateBoxModule,
		DxNumberBoxModule,
		DxSelectBoxModule,
		DxScrollViewModule,
		DxTextAreaModule,
		DataGridMttoModule,
		BarraDataMttoModule,
		DataLookupModule,
		ToastModule,
		DxToolbarModule,
		DxPopupModule,
	],
    RouterModule.forChild(routes),
    CommonModule,
    DxFormModule,
    DxDataGridModule,
    DxButtonModule,
    DxLoadPanelModule,
    DxDropDownBoxModule,
    DxCheckBoxModule,
    DxTabPanelModule,
    DataGridMttoModule,
    BarraDataMttoModule,
    DataLookupModule,
    ToastModule,
    DxToolbarModule,
    DxPopupModule
],
	exports: [RouterModule],
	declarations: [ScSolicitudEmpleoComponent, ScSolicitudEmpleoEditarPersonaComponent],
})
export class ScSolicitudEmpleoRoutingModule {}
