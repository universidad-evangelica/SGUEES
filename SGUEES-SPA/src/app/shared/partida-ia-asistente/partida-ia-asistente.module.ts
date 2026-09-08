import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartidaIaAsistenteComponent } from './partida-ia-asistente.component';

@NgModule({
	imports: [CommonModule, FormsModule],
	declarations: [PartidaIaAsistenteComponent],
	exports: [PartidaIaAsistenteComponent],
})
export class PartidaIaAsistenteModule {}
