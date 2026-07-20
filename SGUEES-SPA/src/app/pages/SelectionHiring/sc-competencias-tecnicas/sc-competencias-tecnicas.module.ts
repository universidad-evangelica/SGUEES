// Qué hace: módulo Angular de Competencias Técnicas.
// Cómo: importa ScCompetenciasTecnicasRoutingModule para registrar la ruta del catálogo.
import { NgModule } from '@angular/core';
import { ScCompetenciasTecnicasRoutingModule } from './sc-competencias-tecnicas-routing.module';

// Qué hace: módulo contenedor del mantenimiento de competencias técnicas.
// Cómo: solo declara el import de ScCompetenciasTecnicasRoutingModule.
@NgModule({
	imports: [ScCompetenciasTecnicasRoutingModule],
})
export class ScCompetenciasTecnicasModule {}
