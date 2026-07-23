// Qué hace: routing y declaraciones DevExtreme/layout de la vista Competencias Conductuales.
// Cómo: registra la ruta del componente ScCompetenciasConductualesComponent junto con los módulos DevExtreme y de layout que usa.
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { ScCompetenciasConductualesComponent } from './sc-competencias-conductuales.component';

// Qué hace: ruta lazy del mantenimiento de competencias conductuales.
// Cómo: asocia la ruta vacía ('') con ScCompetenciasConductualesComponent.
const routes: Routes = [{ path: '', component: ScCompetenciasConductualesComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxButtonModule,
		DxCheckBoxModule,
		DxFormModule,
		DxLoadPanelModule,
		DxSelectBoxModule,
		DxTextAreaModule,
		DxTextBoxModule,
		DxTooltipModule,
		BarraDataMttoModule,
		DataGridMttoModule,
		DataLookupModule,
	],
	exports: [RouterModule],
	declarations: [ScCompetenciasConductualesComponent],
})
// Qué hace: módulo de routing de Competencias Conductuales.
// Cómo: declara ScCompetenciasConductualesComponent, importa los módulos DevExtreme/layout necesarios y expone RouterModule con las rutas hijas del catálogo.
export class ScCompetenciasConductualesRoutingModule {}
