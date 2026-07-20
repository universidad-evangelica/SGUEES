// Qué hace: routing y declaraciones DevExtreme/layout de la vista Disponibilidad de Horario.
// Cómo: registra la ruta del componente ScDisponibilidadHorarioComponent junto con los módulos DevExtreme y de layout que usa.
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
import { ScDisponibilidadHorarioComponent } from './sc-disponibilidad-horario.component';

// Qué hace: ruta lazy del mantenimiento de disponibilidad de horario.
// Cómo: asocia la ruta vacía ('') con ScDisponibilidadHorarioComponent.
const routes: Routes = [{ path: '', component: ScDisponibilidadHorarioComponent }];

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
	],
	exports: [RouterModule],
	declarations: [ScDisponibilidadHorarioComponent],
})
// Qué hace: módulo de routing de Disponibilidad de Horario.
// Cómo: declara ScDisponibilidadHorarioComponent, importa los módulos DevExtreme/layout necesarios y expone RouterModule con las rutas hijas del catálogo.
export class ScDisponibilidadHorarioRoutingModule {}
