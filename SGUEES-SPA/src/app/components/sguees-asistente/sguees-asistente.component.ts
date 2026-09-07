import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AIService } from 'src/app/services/ai.service';
import { AsistenteMenuService } from './asistente-menu.service';
import { AsistentePromptService } from './asistente-prompt.service';
import { AsistenteOpcion } from './models/asistente-opcion.model';
import { resolveScreenHint } from './asistente-screen-hints';

type AsistenteTab = 'recorrido' | 'pantalla' | 'pregunta';

@Component({
	selector: 'app-sguees-asistente',
	templateUrl: './sguees-asistente.component.html',
	styleUrls: ['./sguees-asistente.component.scss'],
})
export class SgueesAsistenteComponent implements OnInit {
	activeTab: AsistenteTab = 'recorrido';
	opciones: AsistenteOpcion[] = [];
	loadingMenu = true;
	loadingAi = false;
	error: string | null = null;
	respuesta = '';
	preguntaLibre = '';
	preguntaPantalla = '';
	rutaConsulta = '';

	constructor(
		private authService: AuthService,
		private router: Router,
		private route: ActivatedRoute,
		private ai: AIService,
		private menuService: AsistenteMenuService,
		private promptService: AsistentePromptService
	) {}

	ngOnInit(): void {
		const rutaParam = this.route.snapshot.queryParamMap.get('ruta');
		if (rutaParam?.trim()) {
			this.rutaConsulta = rutaParam.trim().startsWith('/') ? rutaParam.trim() : `/${rutaParam.trim()}`;
		}

		this.menuService
			.loadOpciones()
			.pipe(take(1))
			.subscribe({
				next: (items) => {
					this.opciones = items;
					this.loadingMenu = false;
				},
				error: () => {
					this.loadingMenu = false;
					this.error = 'No se pudo cargar su menú. Verifique la sesión.';
				},
			});
	}

	get nombreUsuario(): string {
		return (
			this.authService.decodedToken?.unique_name ||
			this.authService.decodedToken?.nameid ||
			'Usuario'
		);
	}

	get nombreEmpresa(): string {
		return this.authService.decodedToken?.NOMBRE_EMPRESA || '—';
	}

	get rutaActual(): string {
		const manual = (this.rutaConsulta || '').trim();
		if (manual) {
			return manual.startsWith('/') ? manual : `/${manual}`;
		}
		const url = this.router.url.split('?')[0] || '/';
		return url === '/asistente' ? '/home' : url;
	}

	get hintActual() {
		return resolveScreenHint(this.rutaActual);
	}

	get permisoActual(): string {
		const keys = this.authService.resolvePermissionKeysFromUrl(this.rutaActual);
		for (const key of keys) {
			const perm = this.authService.decodedToken?.[key];
			if (typeof perm === 'string' && perm.length > 0) {
				return perm;
			}
		}
		return '—';
	}

	setTab(tab: AsistenteTab): void {
		this.activeTab = tab;
	}

	irOpcion(ruta: string): void {
		if (!ruta) {
			return;
		}
		void this.router.navigateByUrl(ruta);
	}

	generarRecorrido(): void {
		const prompt = this.promptService.buildOnboardingPrompt({
			nombreUsuario: this.nombreUsuario,
			nombreEmpresa: this.nombreEmpresa,
			opciones: this.opciones,
		});
		this.callAi(prompt);
	}

	explicarPantallaActual(): void {
		const prompt = this.promptService.buildScreenPrompt({
			nombreUsuario: this.nombreUsuario,
			ruta: this.rutaActual,
			hint: this.hintActual,
			permiso: this.permisoActual,
			pregunta: this.preguntaPantalla,
		});
		this.callAi(prompt);
	}

	enviarPregunta(): void {
		if (!this.preguntaLibre.trim()) {
			this.error = 'Escriba una pregunta.';
			return;
		}
		const prompt = this.promptService.buildFreeQuestionPrompt({
			nombreUsuario: this.nombreUsuario,
			opciones: this.opciones,
			pregunta: this.preguntaLibre,
		});
		this.callAi(prompt);
	}

	private callAi(prompt: string): void {
		this.loadingAi = true;
		this.error = null;
		this.respuesta = '';
		this.ai.complete({ prompt }).subscribe({
			next: (res) => {
				this.respuesta = res?.result || '';
				this.loadingAi = false;
			},
			error: (err) => {
				this.loadingAi = false;
				this.error =
					err?.error?.ErrorMessage ||
					err?.error?.message ||
					err?.message ||
					'Ollama no está activo. Inicie la app Ollama o ejecute "ollama serve" e instale el modelo: ollama pull llama3';
			},
		});
	}
}
