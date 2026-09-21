import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';

import { AcaProspectoComponent } from './aca-prospecto.component';

const routes: Routes = [{ path: '', component: AcaProspectoComponent }];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        DxFormModule,
        DxDataGridModule,
        DxLoadPanelModule,
        DxCheckBoxModule,
        DxTabPanelModule,
        DataGridMttoModule,
        BarraDataMttoModule,
    ],
    exports: [RouterModule],
    declarations: [AcaProspectoComponent],
})
export class AcaProspectoRoutingModule {}
