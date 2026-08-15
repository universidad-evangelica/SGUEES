// Qué hace: declara la ruta de estructura territorial y sus módulos de UI.
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { GenEstructuraTerritorialComponent } from './gen-estructura-territorial.component';

// Qué hace: fija la ruta vacía; el path real lo define el lazy load del menú.
const routes: Routes = [{ path: '', component: GenEstructuraTerritorialComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxButtonModule,
		DxFormModule,
		DxLoadPanelModule,
		DxPopupModule,
		BarraDataMttoModule,
		DataGridMttoModule,
	],
	exports: [RouterModule],
	declarations: [GenEstructuraTerritorialComponent],
})
export class GenEstructuraTerritorialRoutingModule {}
