import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { ScExpedienteCandidatoComponent } from './sc-expediente-candidato.component';

const routes: Routes = [{ path: '', component: ScExpedienteCandidatoComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxCheckBoxModule,
		DxDataGridModule,
		DxDateBoxModule,
		DxFormModule,
		DxLoadPanelModule,
		DxNumberBoxModule,
		DxTextBoxModule,
		BarraDataMttoModule,
		DataGridMttoModule,
	],
	exports: [RouterModule],
	declarations: [ScExpedienteCandidatoComponent],
})
export class ScExpedienteCandidatoRoutingModule {}
