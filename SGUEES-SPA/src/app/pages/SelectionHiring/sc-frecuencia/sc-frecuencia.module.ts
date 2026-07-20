// Qué hace: módulo Angular de Frecuencia.
// Cómo: importa ScFrecuenciaRoutingModule para registrar la ruta del catálogo.
import { NgModule } from '@angular/core';
import { ScFrecuenciaRoutingModule } from './sc-frecuencia-routing.module';

// Qué hace: módulo contenedor del mantenimiento de frecuencia.
// Cómo: solo declara el import de ScFrecuenciaRoutingModule.
@NgModule({
	imports: [ScFrecuenciaRoutingModule],
})
export class ScFrecuenciaModule {}
