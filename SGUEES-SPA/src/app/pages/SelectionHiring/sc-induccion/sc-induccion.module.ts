// Módulo Angular que importa el routing de Inducción.
import { NgModule } from '@angular/core';
import { ScInduccionRoutingModule } from './sc-induccion-routing.module';

// Módulo contenedor del mantenimiento de inducción.
@NgModule({
	imports: [ScInduccionRoutingModule],
})
export class ScInduccionModule {}
