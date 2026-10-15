import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DxFormModule, DxLoadPanelModule, DxDataGridModule, DxButtonModule, DxPopupModule } from 'devextreme-angular';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { AcaPeriodosAcademicosComponent } from './aca-periodos-academicos.component';
@NgModule({
    imports: [CommonModule, RouterModule.forChild([{ path: '', component: AcaPeriodosAcademicosComponent }]),
        DxFormModule, DxLoadPanelModule, DxDataGridModule, DxButtonModule, DxPopupModule, DataGridMttoModule, DataLookupModule, BarraDataMttoModule],
    declarations: [AcaPeriodosAcademicosComponent], exports: [RouterModule],
})
export class AcaPeriodosAcademicosModule {}
