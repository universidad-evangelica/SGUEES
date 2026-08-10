// Qué hace: módulo Angular de puestos por unidad.
// Cómo: importa el routing module que declara el componente y sus dependencias DevExtreme/layout.
import { NgModule } from '@angular/core';
import { GenUnidadesPuestoRoutingModule } from './gen-unidades-puesto-routing.module';

@NgModule({
	imports: [GenUnidadesPuestoRoutingModule],
})
export class GenUnidadesPuestoModule {}
