import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';

import { ConCierreAperturaComponent } from './con-cierre-apertura.component';

const routes: Routes = [{ path: '', component: ConCierreAperturaComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxDataGridModule,
		DxButtonModule,
		DxLoadPanelModule,
		DataGridMttoModule,
	],
	exports: [RouterModule],
	declarations: [ConCierreAperturaComponent],
})
export class ConCierreAperturaRoutingModule {}
