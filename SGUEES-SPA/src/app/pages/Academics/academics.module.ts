// Qué hace: módulo raíz de Académico en el SPA.
// Cómo: carga las rutas de Academics.
import { NgModule } from '@angular/core';
import { AcademicsRoutingModule } from './academics-routing.module';

@NgModule({
  imports: [
    AcademicsRoutingModule
  ]
})
export class AcademicsModule { }
