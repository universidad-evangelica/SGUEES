// Modulo de feature: solo importa el routing (declaraciones viven en el routing module).
import { NgModule } from '@angular/core';
import { ScDescriptorPuestoRoutingModule } from './sc-descriptor-puesto-routing.module';

@NgModule({
	imports: [ScDescriptorPuestoRoutingModule],
})
export class ScDescriptorPuestoModule {}
