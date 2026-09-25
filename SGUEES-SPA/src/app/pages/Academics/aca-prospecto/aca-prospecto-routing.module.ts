import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';

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
        DxButtonModule,
        DxTextBoxModule,
        DxTabPanelModule,
        DataGridMttoModule,
        BarraDataMttoModule,
        DataLookupModule,
    ],
    exports: [RouterModule],
    declarations: [AcaProspectoComponent],
})
export class AcaProspectoRoutingModule {}
