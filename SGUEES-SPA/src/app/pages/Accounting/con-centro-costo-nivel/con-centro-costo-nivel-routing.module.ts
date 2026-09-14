import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';

import { ConCentroCostoNivelComponent } from './con-centro-costo-nivel.component';

const routes: Routes = [{ path: '', component: ConCentroCostoNivelComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxFormModule,
		DxDataGridModule,
		DxLoadPanelModule,
		DxButtonModule,
		DataGridMttoModule,
		BarraDataMttoModule,
	],
	exports: [RouterModule],
	declarations: [ConCentroCostoNivelComponent],
})
export class ConCentroCostoNivelRoutingModule {}
