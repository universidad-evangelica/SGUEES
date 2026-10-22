// Qué hace: módulo Angular del catálogo de Plantillas de Correo.
// Cómo lo hace: importa GenParametroPlantillaRoutingModule para empaquetar la vista de plantillas de correo.
import { NgModule } from '@angular/core';
import { GenParametroPlantillaRoutingModule } from './gen-parametro-plantilla-routing.module';

@NgModule({
	imports: [GenParametroPlantillaRoutingModule],
})
export class GenParametroPlantillaModule {}
