import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DxFormModule, DxLoadPanelModule, DxDataGridModule, DxButtonModule, DxPopupModule, DxTabPanelModule, DxSelectBoxModule, DxDateBoxModule } from 'devextreme-angular';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { AcaPeriodosAcademicosComponent } from './aca-periodos-academicos.component';
import { AcaCiclosComponent } from './ciclos/aca-ciclos.component';
@NgModule({
    imports: [CommonModule, RouterModule.forChild([{ path: '', component: AcaCiclosComponent }]),
        DxFormModule, DxLoadPanelModule, DxDataGridModule, DxButtonModule, DxPopupModule, DxTabPanelModule, DxSelectBoxModule, DxDateBoxModule, DataGridMttoModule, DataLookupModule, BarraDataMttoModule],
    declarations: [AcaPeriodosAcademicosComponent, AcaCiclosComponent], exports: [RouterModule],
})
export class AcaPeriodosAcademicosModule {}
