// Qué hace: módulo Angular de versiones socioeconómico.
// Cómo lo hace: importa AcaSeVersionRoutingModule para registrar la ruta del catálogo.
import { NgModule } from '@angular/core';
import { AcaSeVersionRoutingModule } from './aca-se-version-routing.module';

@NgModule({
	imports: [AcaSeVersionRoutingModule],
})
export class AcaSeVersionModule {}
