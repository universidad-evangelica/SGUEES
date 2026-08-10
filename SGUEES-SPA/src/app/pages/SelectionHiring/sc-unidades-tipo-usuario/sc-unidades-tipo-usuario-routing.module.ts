// Qué hace: routing y declaraciones DevExtreme/layout de la vista Unidades por Tipo de Usuario.
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
import { ScUnidadesTipoUsuarioComponent } from './sc-unidades-tipo-usuario.component';

// Qué hace: ruta lazy del mantenimiento de unidades por tipo de usuario.
// Cómo: path vacío carga ScUnidadesTipoUsuarioComponent.
const routes: Routes = [{ path: '', component: ScUnidadesTipoUsuarioComponent }];

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
	declarations: [ScUnidadesTipoUsuarioComponent],
})
// Qué hace: módulo de routing de unidades por tipo de usuario.
// Cómo: declara el componente y registra las dependencias UI necesarias para browse + detalle.
export class ScUnidadesTipoUsuarioRoutingModule {}
