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
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';


import { ScRequisicionPersonalComponent } from './sc-requisicion-personal.component';
import { ToastModule } from "primeng/toast";
import { DxToolbarModule } from "devextreme-angular/ui/toolbar"; //importar el modulo de Toast para primeNG

import { ScPersonaDatosSharedModule } from '../shared/sc-persona-datos-shared.module';

const routes: Routes = [{ path: '', component: ScRequisicionPersonalComponent }];


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
    DxTabPanelModule,
    DxPopupModule,
    DxScrollViewModule,
    DataGridMttoModule,
    BarraDataMttoModule,
    DataLookupModule,
    ToastModule,
    DxToolbarModule,
    ScPersonaDatosSharedModule,
],
    exports: [RouterModule],
    declarations: [ScRequisicionPersonalComponent],
})
export class ScRequisicionPersonalRoutingModule {}
