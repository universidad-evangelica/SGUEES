// Qué hace: módulo contenedor del mantenimiento de impacto económico.
// Cómo: importa ScImpactoEconomicoRoutingModule para registrar la ruta lazy del catálogo.
import { NgModule } from '@angular/core';
import { ScImpactoEconomicoRoutingModule } from './sc-impacto-economico-routing.module';

@NgModule({
	imports: [ScImpactoEconomicoRoutingModule],
})
export class ScImpactoEconomicoModule {}
