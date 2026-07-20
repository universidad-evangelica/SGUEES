import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';

import { BanDocumentoProcesoComponent } from './ban-documento-proceso.component';

@NgModule({
	imports: [
		CommonModule,
		DxDateBoxModule,
		DxButtonModule,
		DxLoadPanelModule,
		DxSelectBoxModule,
		DxFormModule,
		DxDataGridModule,
		DataGridMttoModule,
	],
	declarations: [BanDocumentoProcesoComponent],
	exports: [BanDocumentoProcesoComponent],
})
export class BanDocumentoProcesoModule {}
