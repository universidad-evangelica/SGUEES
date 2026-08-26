import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';
import { ToastModule } from 'primeng/toast';
import { ScSolicitudEmpleoEditarPersonaComponent } from '../sc-solicitud-empleo/sc-solicitud-empleo-editar-persona.component';
import { ScPersonaDatosVistaComponent } from './sc-persona-datos-vista/sc-persona-datos-vista.component';

/**
 * Módulo compartido: vista lectura de persona + modal de edición (mismo de sc-solicitud-empleo).
 */
@NgModule({
	imports: [
		CommonModule,
		DxButtonModule,
		DxCheckBoxModule,
		DxDateBoxModule,
		DxNumberBoxModule,
		DxPopupModule,
		DxScrollViewModule,
		DxSelectBoxModule,
		DxTabPanelModule,
		DxTextAreaModule,
		DxTextBoxModule,
		DxToolbarModule,
		ToastModule,
	],
	declarations: [ScPersonaDatosVistaComponent, ScSolicitudEmpleoEditarPersonaComponent],
	exports: [ScPersonaDatosVistaComponent, ScSolicitudEmpleoEditarPersonaComponent],
})
export class ScPersonaDatosSharedModule {}
