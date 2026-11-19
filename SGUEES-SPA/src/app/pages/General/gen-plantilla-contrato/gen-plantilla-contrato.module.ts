// Qué hace: módulo Angular de Plantillas de Contratos.
// Cómo lo hace: importa GenPlantillaContratoRoutingModule para registrar la vista en el módulo General.
import { NgModule } from '@angular/core';
import { GenPlantillaContratoRoutingModule } from './gen-plantilla-contrato-routing.module';

@NgModule({
	imports: [GenPlantillaContratoRoutingModule],
})
export class GenPlantillaContratoModule {}

