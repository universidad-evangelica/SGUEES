// Qué hace: routing y declaraciones DevExtreme/layout de la vista versiones socioeconómico.
// Cómo lo hace: registra la ruta del componente AcaSeVersionComponent junto con los módulos DevExtreme y de layout que usa.
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { ToastModule } from 'primeng/toast';
import { AcaSeVersionComponent } from './aca-se-version.component';

const routes: Routes = [{ path: '', component: AcaSeVersionComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxButtonModule,
		DxCheckBoxModule,
		DxDateBoxModule,
		DxFormModule,
		DxLoadPanelModule,
		DxSelectBoxModule,
		DxTextAreaModule,
		DxTextBoxModule,
		DxTooltipModule,
		BarraDataMttoModule,
		DataGridMttoModule,
		ToastModule,
	],
	exports: [RouterModule],
	declarations: [AcaSeVersionComponent],
})
export class AcaSeVersionRoutingModule {}
