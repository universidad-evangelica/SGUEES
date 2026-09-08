import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AIService } from 'src/app/services/ai.service';
import { resolveScreenHint } from 'src/app/components/sguees-asistente/asistente-screen-hints';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { PartidaIaContexto } from './partida-ia.models';
import { PartidaIaPromptService } from './partida-ia-prompt.service';
import { puedeIrARuta, resolvePartidaGuia, PartidaGuiaResuelta } from './partida-ia-playbooks';

@Component({
	selector: 'app-partida-ia-asistente',
	templateUrl: './partida-ia-asistente.component.html',
	styleUrls: ['./partida-ia-asistente.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class PartidaIaAsistenteComponent {
	@Input() contexto: PartidaIaContexto = {};
	/** Nombre de la opción de menú (ej. Partidas Contables). */
	@Input() tituloOpcion = '';

	panelVisible = false;
	loadingAi = false;
	errorAi: string | null = null;
	respuestaAi = '';
	preguntaLibre = '';
	mostrarSeccionIa = false;

	constructor(
		private router: Router,
		private authService: AuthService,
		private appInfoService: AppInfoService,
		private promptService: PartidaIaPromptService,
		private ai: AIService
	) {}

	get rutaActual(): string {
		return this.router.url.split('?')[0] || '/con-partida';
	}

	get permisoActual(): string {
		return this.appInfoService.getPermiso(this.rutaActual) || '';
	}

	get nombreUsuario(): string {
		return (
			this.authService.decodedToken?.unique_name ||
			this.authService.decodedToken?.nameid ||
			'Usuario'
		);
	}

	get guia(): PartidaGuiaResuelta {
		return resolvePartidaGuia(this.rutaActual, this.contexto);
	}

	get hintTitulo(): string {
		return this.guia.tituloPantalla;
	}

	get etiquetaBoton(): string {
		const nombre = (this.tituloOpcion || this.guia.tituloPantalla || 'partidas').trim();
		return `Guía de ${nombre}`;
	}

	abrir(): void {
		this.panelVisible = true;
		this.respuestaAi = '';
		this.errorAi = null;
		this.mostrarSeccionIa = false;
	}

	cerrar(): void {
		this.panelVisible = false;
	}

	toggleSeccionIa(): void {
		this.mostrarSeccionIa = !this.mostrarSeccionIa;
		if (!this.mostrarSeccionIa) {
			this.respuestaAi = '';
			this.errorAi = null;
		}
	}

	puedeIr(ruta: string): boolean {
		return puedeIrARuta(ruta, (r) => this.appInfoService.getPermiso(r) || '');
	}

	siguienteVisible(): boolean {
		const sig = this.guia.siguiente;
		return !!sig && this.puedeIr(sig.ruta);
	}

	preguntarIA(): void {
		const pregunta = this.preguntaLibre.trim();
		if (!pregunta) {
			this.errorAi = 'Escriba su duda concreta sobre lo que ve en pantalla.';
			return;
		}

		const prompt = this.promptService.buildScreenPrompt({
			nombreUsuario: this.nombreUsuario,
			ruta: this.rutaActual,
			hint: resolveScreenHint(this.rutaActual),
			permiso: this.permisoActual,
			contexto: this.contexto,
			pregunta,
		});
		this.consultarIa(prompt);
	}

	irOpcion(ruta: string): void {
		if (!ruta || !this.puedeIr(ruta)) {
			return;
		}
		this.cerrar();
		void this.router.navigateByUrl(ruta);
	}

	esPasoFlujoActual(index: number): boolean {
		return index === this.guia.flujoIndiceActual;
	}

	esPasoFlujoHecho(index: number): boolean {
		return index < this.guia.flujoIndiceActual;
	}

	private consultarIa(prompt: string): void {
		if (this.loadingAi) {
			return;
		}

		this.loadingAi = true;
		this.errorAi = null;
		this.respuestaAi = '';

		this.ai.complete({ prompt }).subscribe({
			next: (res) => {
				this.loadingAi = false;
				this.respuestaAi = (res?.result || '').trim();
			},
			error: (err) => {
				this.loadingAi = false;
				this.errorAi =
					err?.error?.ErrorMessage ||
					err?.error?.message ||
					err?.message ||
					'Ollama no respondió. La guía de arriba sigue disponible sin IA.';
			},
		});
	}
}
