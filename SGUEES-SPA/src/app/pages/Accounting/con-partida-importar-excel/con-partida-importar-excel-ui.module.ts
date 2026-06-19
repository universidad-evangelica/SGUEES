import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxFileUploaderModule } from 'devextreme-angular/ui/file-uploader';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';

import { ConPartidaImportarExcelComponent } from './con-partida-importar-excel.component';

@NgModule({
	imports: [
		CommonModule,
		DxFormModule,
		DxDataGridModule,
		DxButtonModule,
		DxLoadPanelModule,
		DxFileUploaderModule,
		DataLookupModule,
	],
	declarations: [ConPartidaImportarExcelComponent],
	exports: [ConPartidaImportarExcelComponent],
})
export class ConPartidaImportarExcelUiModule {}
