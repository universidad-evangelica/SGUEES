// Qué hace: routing y declaraciones DevExtreme/layout de opciones socioeconómico.
// Cómo lo hace: registra AcaSeOpcionComponent con los módulos que usa.
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { ToastModule } from 'primeng/toast';
import { AcaSeOpcionComponent } from './aca-se-opcion.component';

const routes: Routes = [{ path: '', component: AcaSeOpcionComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxButtonModule,
		DxCheckBoxModule,
		DxFormModule,
		DxLoadPanelModule,
		DxNumberBoxModule,
		DxSelectBoxModule,
		DxTextBoxModule,
		DxTooltipModule,
		BarraDataMttoModule,
		DataGridMttoModule,
		ToastModule,
	],
	exports: [RouterModule],
	declarations: [AcaSeOpcionComponent],
})
export class AcaSeOpcionRoutingModule {}
