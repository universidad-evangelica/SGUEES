import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { ToastModule } from 'primeng/toast';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { ScPersonaDatosSharedModule } from '../shared/sc-persona-datos-shared.module';
import { ScExpedienteCandidatoComponent } from './sc-expediente-candidato.component';

const routes: Routes = [{ path: '', component: ScExpedienteCandidatoComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxButtonModule,
		DxCheckBoxModule,
		DxDataGridModule,
		DxDateBoxModule,
		DxFormModule,
		DxLoadPanelModule,
		DxNumberBoxModule,
		DxSelectBoxModule,
		DxScrollViewModule,
		DxTabPanelModule,
		DxTextAreaModule,
		DxTextBoxModule,
		ToastModule,
		BarraDataMttoModule,
		DataGridMttoModule,
		ScPersonaDatosSharedModule,
	],
	exports: [RouterModule],
	declarations: [ScExpedienteCandidatoComponent],
})
export class ScExpedienteCandidatoRoutingModule {}
