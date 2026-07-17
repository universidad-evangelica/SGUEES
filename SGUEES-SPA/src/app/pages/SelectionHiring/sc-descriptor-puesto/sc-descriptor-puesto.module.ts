// Modulo de feature: solo importa el routing (declaraciones viven en el routing module).
import { NgModule } from '@angular/core';
import { ScDescriptorPuestoRoutingModule } from './sc-descriptor-puesto-routing.module';

// Módulo feature del descriptor: solo reexporta el routing (declaraciones e imports DevExtreme viven allí).
@NgModule({
	imports: [ScDescriptorPuestoRoutingModule],
})
export class ScDescriptorPuestoModule {}
