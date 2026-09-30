// Qué hace: módulo Angular de Empleado.
// Cómo: importa GenEmpleadoRoutingModule para registrar la ruta del browse.
import { NgModule } from '@angular/core';
import { GenEmpleadoRoutingModule } from './gen-empleado-routing.module';

@NgModule({
	imports: [GenEmpleadoRoutingModule],
})
export class GenEmpleadoModule {}
