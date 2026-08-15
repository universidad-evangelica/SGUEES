import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';

import { FirmasDocumentoComponent } from './firmas-documento.component';

@NgModule({
    imports: [
        CommonModule,
        DxLoadIndicatorModule,
        DataGridMttoModule,
    ],
    declarations: [FirmasDocumentoComponent],
    exports: [FirmasDocumentoComponent],
})
export class FirmasDocumentoModule {}