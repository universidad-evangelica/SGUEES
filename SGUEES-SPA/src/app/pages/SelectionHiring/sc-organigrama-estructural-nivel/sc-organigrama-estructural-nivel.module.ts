import { NgModule } from '@angular/core';
import { SC_OrganigramaEstructuralNivelRoutingModule } from './sc-organigrama-estructural-nivel-routing.module';
import { FirmasDocumentoModule } from 'src/app/shared/components/firmas-documento/firmas-documento.module';
@NgModule({
    imports: [SC_OrganigramaEstructuralNivelRoutingModule,
         FirmasDocumentoModule
    ],
})
export class SC_OrganigramaEstructuralNivelModule {}
