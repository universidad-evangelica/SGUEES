import { NgModule } from '@angular/core';
import { ScDescriptorPuestoRoutingModule } from './sc-descriptor-puesto-routing.module';

// Módulo feature del descriptor: solo reexporta el routing (declaraciones e imports DevExtreme viven allí).
@NgModule({
	imports: [ScDescriptorPuestoRoutingModule],
})
export class ScDescriptorPuestoModule {}
