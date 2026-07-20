// Qué hace: módulo contenedor del mantenimiento de responsabilidad del cargo.
// Cómo: importa ScResponsabilidadCargoRoutingModule para registrar la ruta lazy del catálogo.
import { NgModule } from '@angular/core';
import { ScResponsabilidadCargoRoutingModule } from './sc-responsabilidad-cargo-routing.module';

@NgModule({
	imports: [ScResponsabilidadCargoRoutingModule],
})
export class ScResponsabilidadCargoModule {}
