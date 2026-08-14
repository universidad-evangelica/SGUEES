// Qué hace: routing y dependencias visuales de Unidades por Usuario.
// Cómo: declara la ruta local, el componente y módulos DevExtreme/layout requeridos.
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { ToastModule } from 'primeng/toast';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { ScUnidadesUsuarioComponent } from './sc-unidades-usuario.component';

const routes: Routes = [{ path: '', component: ScUnidadesUsuarioComponent }];

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
	declarations: [ScUnidadesUsuarioComponent],
})
export class ScUnidadesUsuarioRoutingModule {}
