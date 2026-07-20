// Qué hace: módulo contenedor del mantenimiento de riesgo del puesto.
// Cómo: importa ScRiesgoPuestoRoutingModule para registrar la ruta lazy del catálogo.
import { NgModule } from '@angular/core';
import { ScRiesgoPuestoRoutingModule } from './sc-riesgo-puesto-routing.module';

@NgModule({
	imports: [ScRiesgoPuestoRoutingModule],
})
export class ScRiesgoPuestoModule {}
