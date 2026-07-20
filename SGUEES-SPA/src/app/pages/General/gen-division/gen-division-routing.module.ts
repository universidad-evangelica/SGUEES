// Qué hace: declara la ruta del mantenimiento de divisiones y sus módulos de UI.
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { ToastModule } from 'primeng/toast';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { GenDivisionComponent } from './gen-division.component';

// Qué hace: fija la ruta vacía; el path real lo define el lazy load del menú.
const routes: Routes = [{ path: '', component: GenDivisionComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxButtonModule,
		DxFormModule,
		DxLoadPanelModule,
		DxTextBoxModule,
		BarraDataMttoModule,
		DataGridMttoModule,
		ToastModule,
	],
	exports: [RouterModule],
	declarations: [GenDivisionComponent],
})
export class GenDivisionRoutingModule {}
