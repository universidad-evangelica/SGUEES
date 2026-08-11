// Qué hace: routing y declaraciones DevExtreme/layout de la vista Puestos por Unidad.
// Cómo: define la ruta lazy, importa grilla/popup/barra mtto y declara el componente.
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { ToastModule } from 'primeng/toast';
import { GenUnidadesPuestoComponent } from './gen-unidades-puesto.component';

const routes: Routes = [{ path: '', component: GenUnidadesPuestoComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxButtonModule,
		DxDataGridModule,
		DxLoadPanelModule,
		DxPopupModule,
		BarraDataMttoModule,
		DataGridMttoModule,
		ToastModule,
	],
	exports: [RouterModule],
	declarations: [GenUnidadesPuestoComponent],
})
export class GenUnidadesPuestoRoutingModule {}
