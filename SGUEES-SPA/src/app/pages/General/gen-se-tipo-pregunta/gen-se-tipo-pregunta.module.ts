// Qué hace: módulo Angular de tipos de pregunta SE.
// Cómo lo hace: importa GenSeTipoPreguntaRoutingModule para registrar la ruta del catálogo.
import { NgModule } from '@angular/core';
import { GenSeTipoPreguntaRoutingModule } from './gen-se-tipo-pregunta-routing.module';

@NgModule({
	imports: [GenSeTipoPreguntaRoutingModule],
})
export class GenSeTipoPreguntaModule {}
