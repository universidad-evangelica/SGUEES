// Módulo lazy de la vista de divisiones; importa solo el routing feature.
import { NgModule } from '@angular/core';
import { GenDivisionRoutingModule } from './gen-division-routing.module';

// Módulo lazy de Divisiones: solo reexporta el routing del mantenimiento.
@NgModule({
	imports: [GenDivisionRoutingModule],
})
export class GenDivisionModule {}
