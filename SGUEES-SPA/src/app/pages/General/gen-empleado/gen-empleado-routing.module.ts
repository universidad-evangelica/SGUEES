// Qué hace: routing y declaraciones DevExtreme/layout de la vista Empleado.
// Cómo: registra la ruta del componente GenEmpleadoComponent.
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { ToastModule } from 'primeng/toast';
import { GenEmpleadoComponent } from './gen-empleado.component';

const routes: Routes = [{ path: '', component: GenEmpleadoComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxButtonModule,
		DxLoadPanelModule,
		DxTabPanelModule,
		DxTooltipModule,
		BarraDataMttoModule,
		DataGridMttoModule,
		ToastModule,
	],
	exports: [RouterModule],
	declarations: [GenEmpleadoComponent],
})
export class GenEmpleadoRoutingModule {}
