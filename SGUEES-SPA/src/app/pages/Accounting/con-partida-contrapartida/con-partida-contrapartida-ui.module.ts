import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { ConPartidaContrapartidaModalComponent } from './con-partida-contrapartida-modal.component';

@NgModule({
	imports: [CommonModule, DxButtonModule, DxDataGridModule, DxLoadPanelModule, DxNumberBoxModule, DxSelectBoxModule],
	declarations: [ConPartidaContrapartidaModalComponent],
	exports: [ConPartidaContrapartidaModalComponent],
})
export class ConPartidaContrapartidaUiModule {}
