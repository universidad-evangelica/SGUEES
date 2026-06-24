import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';

import { ConPartidaModeloSeleccionComponent } from './con-partida-modelo-seleccion.component';

const routes: Routes = [{ path: '', component: ConPartidaModeloSeleccionComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxFormModule,
		DxDataGridModule,
		DxButtonModule,
		DxLoadPanelModule,
		DataGridMttoModule,
	],
	exports: [RouterModule],
	declarations: [ConPartidaModeloSeleccionComponent],
})
export class ConPartidaModeloSeleccionRoutingModule {}
