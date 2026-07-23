import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { SegConfigOpcionComponent } from './seg-config-opcion.component';

const routes: Routes = [{ path: '', component: SegConfigOpcionComponent }];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		DxFormModule,
		DxLoadPanelModule,
		DataGridMttoModule,
		DataLookupModule,
		BarraDataMttoModule,
	],
	exports: [RouterModule],
	declarations: [SegConfigOpcionComponent],
})
export class SegConfigOpcionRoutingModule {}
