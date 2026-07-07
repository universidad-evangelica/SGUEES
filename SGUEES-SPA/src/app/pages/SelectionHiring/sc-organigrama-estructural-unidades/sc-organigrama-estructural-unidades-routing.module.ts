import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxTreeViewModule } from 'devextreme-angular/ui/tree-view';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { MttoHeaderModule } from 'src/app/shared/components/library/mtto-header/mtto-header.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { SC_OrganigramaEstructuralUnidadesComponent } from './sc-organigrama-estructural-unidades.component';

const routes: Routes = [{ path: '', component: SC_OrganigramaEstructuralUnidadesComponent }];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        DxFormModule,
        DxDataGridModule,
        DxLoadPanelModule,
        DxButtonModule,
        DxTreeViewModule,
        DxSelectBoxModule,
        DxCheckBoxModule,
        DxNumberBoxModule,
        DataGridMttoModule,
        BarraDataMttoModule,
        MttoHeaderModule,
        DataLookupModule
    ],
    exports: [RouterModule],
    declarations: [SC_OrganigramaEstructuralUnidadesComponent],
})
export class SC_OrganigramaEstructuralUnidadesRoutingModule {}