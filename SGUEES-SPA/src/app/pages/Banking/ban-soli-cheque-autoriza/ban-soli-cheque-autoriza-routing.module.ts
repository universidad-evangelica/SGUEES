import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';

import { BanSoliChequeAutorizaComponent } from './ban-soli-cheque-autoriza.component';

const routes: Routes = [{ path: '', component: BanSoliChequeAutorizaComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxDateBoxModule,
		DxButtonModule,
		DxLoadPanelModule,
		DxDataGridModule,
		DxSelectBoxModule,
	],
	exports: [RouterModule],
	declarations: [BanSoliChequeAutorizaComponent],
})
export class BanSoliChequeAutorizaRoutingModule {}
