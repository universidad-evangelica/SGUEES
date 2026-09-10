import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
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
		DxScrollViewModule,
		DxSelectBoxModule,
		DxTextBoxModule,
	],
	exports: [RouterModule],
	declarations: [ScBandejaActoresComponent],
})
export class ScBandejaActoresRoutingModule {}
