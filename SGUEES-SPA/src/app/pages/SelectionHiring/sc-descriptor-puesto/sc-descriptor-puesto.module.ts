// Módulo feature del descriptor de puesto: punto de entrada lazy-loaded.
import { NgModule } from '@angular/core';
import { ScDescriptorPuestoRoutingModule } from './sc-descriptor-puesto-routing.module';

// Solo importa el routing module; declaraciones e imports DevExtreme viven allí.
@NgModule({
	imports: [ScDescriptorPuestoRoutingModule],
})
export class ScDescriptorPuestoModule {}
