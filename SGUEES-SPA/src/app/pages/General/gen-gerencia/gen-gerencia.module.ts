import { NgModule } from '@angular/core';
import { GenGerenciaRoutingModule } from './gen-gerencia-routing.module';

// Módulo lazy de Gerencias: solo reexporta el routing del mantenimiento.
@NgModule({
	imports: [GenGerenciaRoutingModule],
})
export class GenGerenciaModule {}
