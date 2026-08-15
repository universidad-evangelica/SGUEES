import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';
import { FirmasDocumentoModule } from 'src/app/shared/components/firmas-documento/firmas-documento.module';
import { SC_OrganigramaEstructuralNivelComponent } from './sc-organigrama-estructural-nivel.component';

const routes: Routes = [{ path: '', component: SC_OrganigramaEstructuralNivelComponent }];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        DxFormModule,
        DxDataGridModule,
        DxLoadPanelModule,
        DataGridMttoModule,
        BarraDataMttoModule,
        DataLookupModule,
        FirmasDocumentoModule  // ← Agregar esta línea
    ],
    exports: [RouterModule],
    declarations: [SC_OrganigramaEstructuralNivelComponent],
})
export class SC_OrganigramaEstructuralNivelRoutingModule {}