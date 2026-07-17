// Módulo lazy de estructura territorial; importa solo el routing feature.
import { NgModule } from '@angular/core';
import { GenEstructuraTerritorialRoutingModule } from './gen-estructura-territorial-routing.module';

@NgModule({
	imports: [GenEstructuraTerritorialRoutingModule],
})
export class GenEstructuraTerritorialModule {}
