import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { CommonModule } from '@angular/common';

import { DxFormModule } from 'devextreme-angular/ui/form';

import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';

import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';

import { DxPopupModule } from 'devextreme-angular/ui/popup';

import { DxButtonModule } from 'devextreme-angular/ui/button';

import { DxBoxModule, DxDrawerModule, DxToolbarModule } from 'devextreme-angular';

import { ConReporteComponent } from './con-reporte.component';



const routes: Routes = [{ path: '', component: ConReporteComponent }];



@NgModule({

	imports: [

		RouterModule.forChild(routes),

		CommonModule,

		DxFormModule,

		DxDataGridModule,

		DxLoadPanelModule,

		DxPopupModule,

		DxButtonModule,

		DxBoxModule,

		DxToolbarModule,

		DxDrawerModule,

	],

	exports: [RouterModule],

	declarations: [ConReporteComponent],

})

export class ConReporteRoutingModule {}


