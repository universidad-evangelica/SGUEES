import { NgModule } from '@angular/core';
import { PlaTipoPuestoRoutingModule } from './pla-tipo-puesto-routing.module';

// Módulo lazy de tipo de puesto: solo reexporta el routing del mantenimiento.
@NgModule({
	imports: [PlaTipoPuestoRoutingModule],
})
export class PlaTipoPuestoModule {}
