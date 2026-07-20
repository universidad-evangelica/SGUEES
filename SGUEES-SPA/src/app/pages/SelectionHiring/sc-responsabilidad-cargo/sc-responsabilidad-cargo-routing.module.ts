// Qué hace: routing y declaraciones DevExtreme/layout de la vista Responsabilidad del Cargo.
// Cómo: registra la ruta del componente ScResponsabilidadCargoComponent junto con los módulos DevExtreme y de layout que usa.
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { ToastModule } from 'primeng/toast';
import { ScResponsabilidadCargoComponent } from './sc-responsabilidad-cargo.component';

// Qué hace: ruta lazy del mantenimiento de responsabilidad del cargo.
// Cómo: asocia la ruta vacía ('') con ScResponsabilidadCargoComponent.
const routes: Routes = [{ path: '', component: ScResponsabilidadCargoComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxButtonModule,
		DxCheckBoxModule,
		DxFormModule,
		DxLoadPanelModule,
		DxSelectBoxModule,
		DxTextBoxModule,
		DxTooltipModule,
		BarraDataMttoModule,
		DataGridMttoModule,
		ToastModule,
	],
	exports: [RouterModule],
	declarations: [ScResponsabilidadCargoComponent],
})
// Qué hace: módulo de routing de Responsabilidad del Cargo.
// Cómo: declara ScResponsabilidadCargoComponent, importa los módulos DevExtreme/layout necesarios y expone RouterModule con las rutas hijas del catálogo.
export class ScResponsabilidadCargoRoutingModule {}
