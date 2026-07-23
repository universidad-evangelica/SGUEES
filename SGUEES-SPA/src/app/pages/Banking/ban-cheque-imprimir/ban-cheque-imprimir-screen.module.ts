import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { DxButtonModule } from 'devextreme-angular/ui/button';

import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';

import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';

import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';

import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';



import { BanChequeImprimirComponent } from './ban-cheque-imprimir.component';



@NgModule({

	imports: [

		CommonModule,

		DxButtonModule,

		DxDateBoxModule,

		DxLoadPanelModule,

		DxSelectBoxModule,

		DataGridMttoModule,

	],

	declarations: [BanChequeImprimirComponent],

	exports: [BanChequeImprimirComponent],

})

export class BanChequeImprimirScreenModule {}


