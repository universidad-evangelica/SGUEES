// Qué hace: routing y declaraciones DevExtreme/layout de la vista Puestos por Unidad.
// Cómo: define la ruta lazy, importa grilla/tabs/lookup/barra mtto y declara el componente.
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
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
		DxTabPanelModule,
		BarraDataMttoModule,
		DataGridMttoModule,
		DataLookupModule,
		ToastModule,
	],
	exports: [RouterModule],
	declarations: [GenUnidadesPuestoComponent],
})
export class GenUnidadesPuestoRoutingModule {}
