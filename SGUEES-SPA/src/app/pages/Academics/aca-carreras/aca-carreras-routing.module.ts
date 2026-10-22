import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DxFormModule, DxLoadPanelModule, DxTabPanelModule, DxDataGridModule, DxButtonModule, DxPopupModule } from 'devextreme-angular';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { AcaCarrerasComponent } from './aca-carreras.component';
import { AcaPlanesAcademicosComponent } from './planes/aca-planes-academicos.component';
import { AcaCarrerasCostosComponent } from './costos/aca-carreras-costos.component';

const routes: Routes = [{ path: '', component: AcaCarrerasComponent }];
@NgModule({
    imports: [RouterModule.forChild(routes), CommonModule, DxFormModule, DxLoadPanelModule, DxTabPanelModule, DxDataGridModule, DxButtonModule,
        DataGridMttoModule, DataLookupModule, BarraDataMttoModule, DxPopupModule],
    declarations: [AcaCarrerasComponent, AcaPlanesAcademicosComponent,AcaCarrerasCostosComponent],
    exports: [RouterModule],
})
export class AcaCarrerasRoutingModule {}

