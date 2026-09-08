import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxBoxModule, DxDateBoxModule, DxDrawerModule, DxPopupModule, DxTabPanelModule, DxToolbarModule } from 'devextreme-angular';
import { ConPartidaOperacionComponent } from './con-partida-operacion.component';
import { PartidaIaAsistenteModule } from 'src/app/shared/partida-ia-asistente/partida-ia-asistente.module';

@NgModule({
	imports: [
		CommonModule,
		PartidaIaAsistenteModule,
		DxFormModule,
		DxDataGridModule,
		DxButtonModule,
		DxLoadPanelModule,
		DxBoxModule,
		DxToolbarModule,
		DxDrawerModule,
		DxDateBoxModule,
		DxPopupModule,
		DxTabPanelModule,
	],
	declarations: [ConPartidaOperacionComponent],
	exports: [ConPartidaOperacionComponent],
})
export class ConPartidaOperacionModule {}
