// Módulo lazy de la vista de gerencias; importa solo el routing feature.
import { NgModule } from '@angular/core';
import { GenGerenciaRoutingModule } from './gen-gerencia-routing.module';

@NgModule({
	imports: [GenGerenciaRoutingModule],
})
export class GenGerenciaModule {}
