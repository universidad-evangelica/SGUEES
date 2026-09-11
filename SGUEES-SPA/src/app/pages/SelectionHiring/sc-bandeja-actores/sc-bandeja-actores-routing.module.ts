import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';

import { ScBandejaActoresComponent } from './sc-bandeja-actores.component';

const routes: Routes = [{ path: '', component: ScBandejaActoresComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxButtonModule,
		DxDataGridModule,
		DxDateBoxModule,
		DxPopupModule,
		DxScrollViewModule,
		DxSelectBoxModule,
		DxTextAreaModule,
		DxTextBoxModule,
	],
	exports: [RouterModule],
	declarations: [ScBandejaActoresComponent],
})
export class ScBandejaActoresRoutingModule {}
