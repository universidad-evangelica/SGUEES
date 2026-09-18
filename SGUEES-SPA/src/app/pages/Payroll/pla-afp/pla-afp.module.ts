// Qué hace: módulo Angular de AFP.
// Cómo: importa PlaAfpRoutingModule para registrar la ruta del catálogo.
import { NgModule } from '@angular/core';
import { PlaAfpRoutingModule } from './pla-afp-routing.module';

@NgModule({
	imports: [PlaAfpRoutingModule],
})
export class PlaAfpModule {}
