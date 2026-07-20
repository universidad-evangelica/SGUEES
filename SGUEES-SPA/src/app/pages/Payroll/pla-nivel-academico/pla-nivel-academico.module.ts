// Qué hace: módulo lazy-load del mantenimiento de nivel académico.
// Cómo: importa PlaNivelAcademicoRoutingModule con la ruta y declaraciones del componente.
import { NgModule } from '@angular/core';
import { PlaNivelAcademicoRoutingModule } from './pla-nivel-academico-routing.module';

@NgModule({
	imports: [PlaNivelAcademicoRoutingModule],
})
export class PlaNivelAcademicoModule {}
