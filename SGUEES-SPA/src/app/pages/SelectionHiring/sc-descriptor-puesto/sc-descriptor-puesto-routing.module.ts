import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { ScDescriptorPuestoComponent } from './sc-descriptor-puesto.component';

// Ruta lazy del mantenimiento: path vacío carga el componente principal del descriptor.
const routes: Routes = [{ path: '', component: ScDescriptorPuestoComponent }];

// Declara el componente y agrupa los módulos DevExtreme y layouts que usa la vista.
@NgModule({
	imports: [
		RouterModule.forChild(routes), // Registro de rutas hijas del feature.
		CommonModule, // Directivas estructurales (*ngIf, *ngFor, pipes).
		DxButtonModule, // Botones DevExtreme.
		DxDataGridModule, // Grillas de datos DevExtreme.
		DxDateBoxModule, // Selector de fechas DevExtreme.
		DxFormModule, // Formularios DevExtreme.
		DxLoadPanelModule, // Panel de carga/indicador de espera.
		DxNumberBoxModule, // Campo numérico DevExtreme.
		DxPopupModule, // Ventanas modales DevExtreme.
		DxSelectBoxModule, // Select/combobox DevExtreme.
		DxTabPanelModule, // Pestañas del descriptor (formato corto/extenso).
		DxTextAreaModule, // Área de texto multilínea DevExtreme.
		DxTextBoxModule, // Campo de texto DevExtreme.
		BarraDataMttoModule, // Barra de acciones del mantenimiento (guardar, nuevo, etc.).
		DataGridMttoModule, // Grid reutilizable con configuración de mantenimiento.
		DataLookupModule, // Lookup reutilizable para catálogos.
	],
	exports: [RouterModule], // Permite reexportar rutas si el módulo padre lo requiere.
	declarations: [ScDescriptorPuestoComponent], // Componente principal del descriptor de puesto.
})
export class ScDescriptorPuestoRoutingModule {}
