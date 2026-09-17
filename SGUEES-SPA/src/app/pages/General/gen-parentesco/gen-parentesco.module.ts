// Qué hace: módulo Angular de Parentesco.
// Cómo: importa GenParentescoRoutingModule para registrar la ruta del catálogo.
import { NgModule } from '@angular/core';
import { GenParentescoRoutingModule } from './gen-parentesco-routing.module';

@NgModule({
	imports: [GenParentescoRoutingModule],
})
export class GenParentescoModule {}
