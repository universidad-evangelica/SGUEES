import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxTemplateModule } from 'devextreme-angular/core';

import { ScTestComponent } from './sc-test.component';

const routes: Routes = [{ path: '', component: ScTestComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxFormModule,
		DxDataGridModule,
		DxButtonModule,
		DxLoadPanelModule,
		DxPopupModule,
		DxTemplateModule,
	],
	exports: [RouterModule],
	declarations: [ScTestComponent],
})
export class ScTestRoutingModule {}
