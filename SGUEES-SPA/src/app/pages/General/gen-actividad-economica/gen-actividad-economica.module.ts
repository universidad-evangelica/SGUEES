// Qué hace: módulo Angular de Actividad Económica.
// Cómo: importa GenActividadEconomicaRoutingModule para registrar la ruta del catálogo.
import { NgModule } from '@angular/core';
import { GenActividadEconomicaRoutingModule } from './gen-actividad-economica-routing.module';

// Qué hace: módulo contenedor del mantenimiento de actividad económica.
// Cómo: solo declara el import de GenActividadEconomicaRoutingModule.
@NgModule({
	imports: [GenActividadEconomicaRoutingModule],
})
export class GenActividadEconomicaModule {}
