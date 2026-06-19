import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxBoxModule, DxDateBoxModule, DxDrawerModule, DxToolbarModule } from 'devextreme-angular';
import { ConPartidaOperacionComponent } from './con-partida-operacion.component';

@NgModule({
	imports: [
		CommonModule,
		DxFormModule,
		DxDataGridModule,
		DxButtonModule,
		DxLoadPanelModule,
		DxBoxModule,
		DxToolbarModule,
		DxDrawerModule,
		DxDateBoxModule,
	],
	declarations: [ConPartidaOperacionComponent],
	exports: [ConPartidaOperacionComponent],
})
export class ConPartidaOperacionModule {}
