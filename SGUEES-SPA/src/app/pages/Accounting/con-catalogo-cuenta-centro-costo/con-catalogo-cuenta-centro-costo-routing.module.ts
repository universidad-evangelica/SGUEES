import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxButtonModule } from 'devextreme-angular/ui/button';

import { ConCatalogoCuentaCentroCostoComponent } from './con-catalogo-cuenta-centro-costo.component';

const routes: Routes = [{ path: '', component: ConCatalogoCuentaCentroCostoComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxDataGridModule,
		DxLoadPanelModule,
		DxButtonModule,
	],
	declarations: [ConCatalogoCuentaCentroCostoComponent],
})
export class ConCatalogoCuentaCentroCostoRoutingModule {}
