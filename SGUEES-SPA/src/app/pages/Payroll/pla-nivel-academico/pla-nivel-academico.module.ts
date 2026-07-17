import { NgModule } from '@angular/core';
import { PlaNivelAcademicoRoutingModule } from './pla-nivel-academico-routing.module';

// Módulo lazy de nivel académico: solo reexporta el routing del mantenimiento.
@NgModule({
	imports: [PlaNivelAcademicoRoutingModule],
})
export class PlaNivelAcademicoModule {}
