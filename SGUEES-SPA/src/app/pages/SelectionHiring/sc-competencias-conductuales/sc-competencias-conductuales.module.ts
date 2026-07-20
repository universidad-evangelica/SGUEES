// Qué hace: módulo Angular de Competencias Conductuales.
// Cómo: importa ScCompetenciasConductualesRoutingModule para registrar la ruta del catálogo.
import { NgModule } from '@angular/core';
import { ScCompetenciasConductualesRoutingModule } from './sc-competencias-conductuales-routing.module';

// Qué hace: módulo contenedor del mantenimiento de competencias conductuales.
// Cómo: solo declara el import de ScCompetenciasConductualesRoutingModule.
@NgModule({
	imports: [ScCompetenciasConductualesRoutingModule],
})
export class ScCompetenciasConductualesModule {}
