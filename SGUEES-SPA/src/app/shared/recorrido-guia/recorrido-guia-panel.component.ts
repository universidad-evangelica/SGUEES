import { Component, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { RecorridoGuiaService } from './recorrido-guia.service';
import { RecorridoGuiaState, RecorridoPaso } from './recorrido-guia.models';

@Component({
	selector: 'app-recorrido-guia-panel',
	templateUrl: './recorrido-guia-panel.component.html',
	styleUrls: ['./recorrido-guia-panel.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class RecorridoGuiaPanelComponent {
	state$: Observable<RecorridoGuiaState> = this.recorrido.state$;

	constructor(public recorrido: RecorridoGuiaService) {}

	cerrar(): void {
		this.recorrido.cerrar();
	}

	siguiente(): void {
		this.recorrido.siguiente();
	}

	anterior(): void {
		this.recorrido.anterior();
	}

	explicarConIa(): void {
		this.recorrido.explicarConIa();
	}

	irOpcion(ruta: string): void {
		this.recorrido.irOpcion(ruta);
	}

	ejecutarAccion(): void {
		this.recorrido.ejecutarAccion();
	}

	irAPaso(index: number): void {
		this.recorrido.irAPasoPublico(index);
	}

	esUltimoPaso(state: RecorridoGuiaState): boolean {
		return state.pasoIndex >= state.pasos.length - 1;
	}

	progresoPct(state: RecorridoGuiaState): number {
		if (!state.pasos.length) {
			return 0;
		}
		return Math.round(((state.pasoIndex + 1) / state.pasos.length) * 100);
	}

	formatText(text: string): string {
		return (text || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
	}

	formatTip(tip: string): string {
		return (tip || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	}

	trackPaso(_index: number, paso: RecorridoPaso): number {
		return paso.index;
	}
}
