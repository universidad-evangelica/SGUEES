// Qué hace: módulo Angular de tipos de institución.
// Cómo lo hace: importa GenTipoInstitucionRoutingModule para registrar la ruta del catálogo.
import { NgModule } from '@angular/core';
import { GenTipoInstitucionRoutingModule } from './gen-tipo-institucion-routing.module';

@NgModule({
	imports: [GenTipoInstitucionRoutingModule],
})
export class GenTipoInstitucionModule {}
