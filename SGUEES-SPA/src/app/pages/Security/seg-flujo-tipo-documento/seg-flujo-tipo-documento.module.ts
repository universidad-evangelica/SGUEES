import { NgModule } from '@angular/core';
import { SegFlujoTipoDocumentoRoutingModule } from './seg-flujo-tipo-documento-routing.module';

import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';

@NgModule({
    imports: [
        SegFlujoTipoDocumentoRoutingModule,
        DxCheckBoxModule,  // Necesario para los checkboxes
        
    ],
})
export class SegFlujoTipoDocumentoModule {}