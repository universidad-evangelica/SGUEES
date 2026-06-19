import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxFileUploaderModule } from 'devextreme-angular/ui/file-uploader';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';

import { ConContabilidadImportarExcelComponent } from './con-contabilidad-importar-excel.component';

const routes: Routes = [{ path: '', component: ConContabilidadImportarExcelComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxDataGridModule,
		DxLoadPanelModule,
		DxButtonModule,
		DxFileUploaderModule,
		DxTabPanelModule,
	],
	declarations: [ConContabilidadImportarExcelComponent],
})
export class ConContabilidadImportarExcelRoutingModule {}
