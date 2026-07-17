// Módulo lazy de la vista de divisiones; importa solo el routing feature.
import { NgModule } from '@angular/core';
import { GenDivisionRoutingModule } from './gen-division-routing.module';

@NgModule({
	imports: [GenDivisionRoutingModule],
})
export class GenDivisionModule {}
