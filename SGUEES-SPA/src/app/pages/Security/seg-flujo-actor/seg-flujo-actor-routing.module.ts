import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';

import { SegFlujoActorComponent } from './seg-flujo-actor.component';

const routes: Routes = [{ path: '', component: SegFlujoActorComponent }];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        DxFormModule,
        DxDataGridModule,
        DxButtonModule,
        DxLoadPanelModule,
        DxDropDownBoxModule,
        DxCheckBoxModule,
        DxSelectBoxModule,
        DxTabPanelModule,
        DataGridMttoModule,
        BarraDataMttoModule,
        DataLookupModule,
    ],
    exports: [RouterModule],
    declarations: [SegFlujoActorComponent],
})
export class SegFlujoActorRoutingModule {}