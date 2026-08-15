// Qué hace: módulo lazy-load del mantenimiento de tipo de puesto.
// Cómo: importa PlaTipoPuestoRoutingModule con la ruta y declaraciones del componente.
import { NgModule } from '@angular/core';
import { PlaTipoPuestoRoutingModule } from './pla-tipo-puesto-routing.module';

@NgModule({
	imports: [PlaTipoPuestoRoutingModule],
})
export class PlaTipoPuestoModule {}
