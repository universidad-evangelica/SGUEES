// Qué hace: módulo Angular de Religión.
// Cómo: importa GenReligionRoutingModule para registrar la ruta del catálogo.
import { NgModule } from '@angular/core';
import { GenReligionRoutingModule } from './gen-religion-routing.module';

@NgModule({
	imports: [GenReligionRoutingModule],
})
export class GenReligionModule {}
