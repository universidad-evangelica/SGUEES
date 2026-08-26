import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
	ScPersonaCompetencia,
	ScPersonaDatos,
	ScPersonaEstudio,
	ScPersonaExperiencia,
	ScPersonaFamiliar,
	ScPersonaFamiliarUees,
	ScPersonaHijo,
	ScPersonaIdioma,
} from '../../sc-solicitud-empleo/models/sc-persona-datos';

/**
 * Vista de solo lectura de datos de persona (réplica del tab Datos Solicitud de sc-solicitud-empleo).
 * La edición se dispara vía (editar) hacia el padre, que abre app-sc-solicitud-empleo-editar-persona.
 */
@Component({
	selector: 'app-sc-persona-datos-vista',
	templateUrl: './sc-persona-datos-vista.component.html',
	styleUrls: ['./sc-persona-datos-vista.component.scss'],
})
export class ScPersonaDatosVistaComponent {
	@Input() personaDatos: ScPersonaDatos | null = null;
	@Input() familiares: ScPersonaFamiliar[] = [];
	@Input() hijos: ScPersonaHijo[] = [];
	@Input() estudios: ScPersonaEstudio[] = [];
	@Input() idiomas: ScPersonaIdioma[] = [];
	@Input() competencias: ScPersonaCompetencia[] = [];
	@Input() experiencias: ScPersonaExperiencia[] = [];
	@Input() familiaresUees: ScPersonaFamiliarUees[] = [];
	@Input() fotoPersonaUrl: string | null = null;
	@Input() cargandoPersonaDatos = false;
	@Input() permiteEdit = false;

	@Output() editar = new EventEmitter<void>();
	@Output() abrirFoto = new EventEmitter<void>();

	get tienePersonaDatos(): boolean {
		return (this.personaDatos?.CORR_PERSONA_DATOS ?? 0) > 0;
	}

	get nombreCompletoPersona(): string {
		if (!this.personaDatos) {
			return '';
		}
		return [this.personaDatos.NOMBRE1, this.personaDatos.NOMBRE2, this.personaDatos.APELLIDO1, this.personaDatos.APELLIDO2]
			.filter((parte) => !!parte && String(parte).trim().length > 0)
			.join(' ');
	}

	get inicialesPersona(): string {
		const nombre = (this.personaDatos?.NOMBRE1 || '').trim();
		const apellido = (this.personaDatos?.APELLIDO1 || '').trim();
		const inicialNombre = nombre ? nombre.charAt(0).toUpperCase() : '';
		const inicialApellido = apellido ? apellido.charAt(0).toUpperCase() : '';
		return `${inicialNombre}${inicialApellido}` || '?';
	}

	onEditar(): void {
		this.editar.emit();
	}

	onAbrirFoto(): void {
		this.abrirFoto.emit();
	}

	textoLectura(valor: unknown): string {
		if (valor === null || valor === undefined) {
			return '—';
		}
		const texto = String(valor).trim();
		return texto.length > 0 ? texto : '—';
	}

	siNo(valor: boolean | null | undefined): string {
		return valor ? 'Sí' : 'No';
	}

	fechaLectura(valor: string | Date | null | undefined): string {
		if (!valor) {
			return '—';
		}
		const fecha = valor instanceof Date ? valor : new Date(valor);
		if (Number.isNaN(fecha.getTime())) {
			return '—';
		}
		const dd = String(fecha.getDate()).padStart(2, '0');
		const mm = String(fecha.getMonth() + 1).padStart(2, '0');
		const yyyy = fecha.getFullYear();
		return `${dd}/${mm}/${yyyy}`;
	}

	fechaHoraLectura(valor: string | Date | null | undefined): string {
		if (!valor) {
			return '—';
		}
		const fecha = valor instanceof Date ? valor : new Date(valor);
		if (Number.isNaN(fecha.getTime())) {
			return '—';
		}
		const dd = String(fecha.getDate()).padStart(2, '0');
		const mm = String(fecha.getMonth() + 1).padStart(2, '0');
		const yyyy = fecha.getFullYear();
		const hh = String(fecha.getHours()).padStart(2, '0');
		const mi = String(fecha.getMinutes()).padStart(2, '0');
		return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
	}

	montoLectura(valor: number | null | undefined): string {
		if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
			return '—';
		}
		return Number(valor).toLocaleString('es-SV', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		});
	}

	etiquetaFamiliar(tipo: string): string {
		switch ((tipo || '').toUpperCase()) {
			case 'PADRE':
				return 'Padre';
			case 'MADRE':
				return 'Madre';
			case 'ESPOSO':
				return 'Esposo(a)';
			default:
				return this.textoLectura(tipo);
		}
	}
}
