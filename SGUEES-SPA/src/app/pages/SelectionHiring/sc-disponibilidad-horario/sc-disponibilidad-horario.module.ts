// Qué hace: módulo Angular de Disponibilidad de Horario.
// Cómo: importa ScDisponibilidadHorarioRoutingModule para registrar la ruta del catálogo.
import { NgModule } from '@angular/core';
import { ScDisponibilidadHorarioRoutingModule } from './sc-disponibilidad-horario-routing.module';

// Qué hace: módulo contenedor del mantenimiento de disponibilidad de horario.
// Cómo: solo declara el import de ScDisponibilidadHorarioRoutingModule.
@NgModule({
	imports: [ScDisponibilidadHorarioRoutingModule],
})
export class ScDisponibilidadHorarioModule {}
