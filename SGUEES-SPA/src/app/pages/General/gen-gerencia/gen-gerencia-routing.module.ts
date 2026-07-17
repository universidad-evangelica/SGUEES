import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { ToastModule } from 'primeng/toast';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { GenGerenciaComponent } from './gen-gerencia.component';

// Ruta por defecto del feature: renderiza el mantenimiento de gerencias.
const routes: Routes = [{ path: '', component: GenGerenciaComponent }];

// Declara el componente y los módulos UI (incluye lookup de división).
@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxButtonModule,
		DxFormModule,
		DxLoadPanelModule,
		DxSelectBoxModule,
		DxTextBoxModule,
		BarraDataMttoModule,
		DataGridMttoModule,
		DataLookupModule,
		ToastModule,
	],
	exports: [RouterModule],
	declarations: [GenGerenciaComponent],
})
export class GenGerenciaRoutingModule {}
