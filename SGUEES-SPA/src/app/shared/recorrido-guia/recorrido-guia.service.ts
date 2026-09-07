import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AIService } from 'src/app/services/ai.service';
import { AsistenteMenuService } from 'src/app/components/sguees-asistente/asistente-menu.service';
import { AsistenteOpcion } from 'src/app/components/sguees-asistente/models/asistente-opcion.model';
import { resolveScreenHint } from 'src/app/components/sguees-asistente/asistente-screen-hints';
import { RecorridoGuiaState, RecorridoPaso, RecorridoSpotlight } from './recorrido-guia.models';
import { resolveRecorridoMenuHint, resolveRecorridoModuloHint } from './recorrido-menu-hints';

const INITIAL_STATE: RecorridoGuiaState = {
	visible: false,
	loading: false,
	loadingAi: false,
	pasoIndex: 0,
	pasos: [],
	aiTexto: '',
	errorAi: null,
	error: null,
	highlightMenuKey: '',
	spotlight: 'center',
};

@Injectable({ providedIn: 'root' })
export class RecorridoGuiaService {
	private readonly stateSubject = new BehaviorSubject<RecorridoGuiaState>({ ...INITIAL_STATE });

	readonly state$ = this.stateSubject.asObservable();

	constructor(
		private authService: AuthService,
		private router: Router,
		private menuService: AsistenteMenuService,
		private ai: AIService
	) {}

	get snapshot(): RecorridoGuiaState {
		return this.stateSubject.value;
	}

	get pasoActual(): RecorridoPaso | null {
		const { pasos, pasoIndex } = this.snapshot;
		return pasos[pasoIndex] ?? null;
	}

	abrir(): void {
		if (this.snapshot.visible) {
			return;
		}
		this.setTourActive(true);
		this.patch({
			visible: true,
			loading: true,
			error: null,
			errorAi: null,
			aiTexto: '',
			pasoIndex: 0,
			spotlight: 'center',
		});

		this.menuService
			.loadOpciones()
			.pipe(take(1))
			.subscribe({
				next: (opciones) => {
					const pasos = this.buildPasos(opciones);
					const first = pasos[0];
					const menuSteps = pasos.filter((p) => p.tipo === 'menu').length;
					this.patch({
						loading: false,
						pasos,
						pasoIndex: 0,
						highlightMenuKey: first?.menuKey ?? '',
						spotlight: first?.spotlight ?? 'center',
						error:
							menuSteps === 0
								? 'No hay pantallas de menú con permiso de lectura; verá solo la guía general.'
								: null,
					});
					if (first) {
						this.sincronizarVista(first);
					}
				},
				error: () => {
					this.patch({
						loading: false,
						error: 'No se pudo cargar su menú. Verifique la sesión.',
					});
				},
			});
	}

	cerrar(): void {
		this.clearSpotlightClasses();
		this.setTourActive(false);
		this.stateSubject.next({ ...INITIAL_STATE });
	}

	siguiente(): void {
		const { pasoIndex, pasos } = this.snapshot;
		if (pasoIndex >= pasos.length - 1) {
			this.cerrar();
			return;
		}
		this.irAPaso(pasoIndex + 1);
	}

	anterior(): void {
		const { pasoIndex } = this.snapshot;
		if (pasoIndex <= 0) {
			return;
		}
		this.irAPaso(pasoIndex - 1);
	}

	irAPasoPublico(index: number): void {
		if (index < 0 || index >= this.snapshot.pasos.length) {
			return;
		}
		this.irAPaso(index);
	}

	irOpcion(ruta: string): void {
		if (!ruta) {
			return;
		}
		this.cerrar();
		void this.router.navigateByUrl(ruta);
	}

	ejecutarAccion(): void {
		const accion = this.pasoActual?.accion;
		if (!accion?.ruta) {
			return;
		}
		void this.router.navigateByUrl(accion.ruta);
	}

	explicarConIa(): void {
		const paso = this.pasoActual;
		if (!paso || this.snapshot.loadingAi) {
			return;
		}

		this.patch({ loadingAi: true, errorAi: null, aiTexto: '' });

		this.ai.complete({ prompt: this.buildAiPrompt(paso) }).subscribe({
			next: (res) => {
				this.patch({
					loadingAi: false,
					aiTexto: (res?.result || '').trim(),
					errorAi: null,
				});
			},
			error: (err) => {
				this.patch({
					loadingAi: false,
					errorAi:
						err?.error?.ErrorMessage ||
						err?.error?.message ||
						err?.message ||
						'Ollama no está activo. Puede continuar el recorrido sin IA.',
				});
			},
		});
	}

	private irAPaso(index: number): void {
		const paso = this.snapshot.pasos[index];
		this.patch({
			pasoIndex: index,
			highlightMenuKey: paso?.menuKey ?? '',
			spotlight: paso?.spotlight ?? 'center',
			aiTexto: '',
			errorAi: null,
		});
		if (paso) {
			this.sincronizarVista(paso);
		}
	}

	private sincronizarVista(paso: RecorridoPaso): void {
		this.applySpotlight(paso.spotlight);

		if (paso.tipo === 'portal' || paso.tipo === 'favoritos') {
			setTimeout(() => this.navegarSinCerrar('/home'), 0);
		}
	}

	private navegarSinCerrar(ruta: string): void {
		const path = this.router.url.split('?')[0];
		if (path !== ruta) {
			void this.router.navigateByUrl(ruta);
		}
	}

	private applySpotlight(spotlight: RecorridoSpotlight): void {
		this.clearSpotlightClasses();
		document.body.classList.add(`sguees-recorrido-spotlight--${spotlight}`);
	}

	private clearSpotlightClasses(): void {
		(['center', 'content', 'header', 'sidebar', 'none'] as RecorridoSpotlight[]).forEach((s) => {
			document.body.classList.remove(`sguees-recorrido-spotlight--${s}`);
		});
	}

	private buildPasos(opciones: AsistenteOpcion[]): RecorridoPaso[] {
		const nombreUsuario =
			this.authService.decodedToken?.unique_name ||
			this.authService.decodedToken?.nameid ||
			'Usuario';
		const nombreEmpresa = this.authService.decodedToken?.NOMBRE_EMPRESA || 'su empresa';
		const totalOpciones = opciones.length;

		const pasos: RecorridoPaso[] = [
			{
				index: 0,
				tipo: 'bienvenida',
				titulo: `¡Hola, ${nombreUsuario}!`,
				subtitulo: 'Bienvenido a SGUEES',
				icon: '👋',
				spotlight: 'center',
				modulo: '',
				menuNombre: '',
				menuKey: '',
				opciones: [],
				textoGuia: `Le guiaremos por el portal, sus accesos rápidos y las **${totalOpciones} pantallas** autorizadas en **${nombreEmpresa}**.`,
				tips: [
					'El recorrido dura unos minutos y puede salir cuando quiera.',
					'Solo verá opciones según su perfil de seguridad.',
					'Use Siguiente para avanzar paso a paso.',
				],
			},
			{
				index: 1,
				tipo: 'portal',
				titulo: 'Portal de inicio',
				subtitulo: 'Su punto de partida',
				icon: '🏠',
				spotlight: 'content',
				modulo: '',
				menuNombre: '',
				menuKey: '',
				opciones: [],
				textoGuia:
					'Al iniciar sesión llega al **portal**. Aquí ve los **módulos** del ERP como tarjetas (Contabilidad, Compras, Bancos…).',
				tips: [
					'Haga clic en un módulo para ver sus menús y pantallas.',
					'Use las pestañas (Procesos, Catálogos…) para organizar las opciones.',
					'El botón **Regresar** lo devuelve al listado de módulos.',
					'Es la forma más visual de descubrir el sistema.',
				],
				accion: { label: 'Ir al portal ahora', ruta: '/home' },
			},
			{
				index: 2,
				tipo: 'favoritos',
				titulo: 'Favoritos',
				subtitulo: 'Accesos directos',
				icon: '⭐',
				spotlight: 'content',
				modulo: '',
				menuNombre: '',
				menuKey: '',
				opciones: [],
				textoGuia:
					'Marque con la **estrella** las pantallas que use a menudo. Aparecerán arriba en **Favoritos** para abrirlas con un solo clic.',
				tips: [
					'Entre a un módulo → elija un menú → pulse la estrella en la tarjeta (no en el título).',
					'Verá el mensaje «Favorito añadido» o «Favorito eliminado».',
					'En la vista principal del portal, la sección Favoritos queda siempre visible.',
					'Los favoritos se guardan por usuario en el servidor.',
				],
				accion: { label: 'Ver portal y favoritos', ruta: '/home' },
			},
			{
				index: 3,
				tipo: 'header',
				titulo: 'Barra superior',
				subtitulo: 'Controles globales',
				icon: '🎛️',
				spotlight: 'header',
				modulo: '',
				menuNombre: '',
				menuKey: '',
				opciones: [],
				textoGuia: 'La barra superior está siempre disponible mientras trabaja en el sistema.',
				tips: [
					'**Menú ☰** — muestra u oculta el panel lateral (útil en pantallas pequeñas).',
					'**?** — abre este recorrido guiado cuando lo necesite.',
					'**Tema claro/oscuro** — cambia la apariencia del portal a su gusto.',
					'**Avatar** — accede a su perfil o cierra sesión.',
				],
			},
			{
				index: 4,
				tipo: 'perfil',
				titulo: 'Mi perfil',
				subtitulo: 'Cuenta y seguridad',
				icon: '👤',
				spotlight: 'header',
				modulo: '',
				menuNombre: '',
				menuKey: '',
				opciones: [],
				textoGuia:
					'Desde el **avatar** elija **Mi perfil** para consultar su usuario, empresa, correo y estado de la cuenta.',
				tips: [
					'Revise sus datos de sesión e instancia activa.',
					'En **Centro de seguridad** puede **cambiar su contraseña**.',
					'Use **Salir** para cerrar sesión de forma segura.',
					'Si falta algún acceso, solicítelo a administración de seguridad.',
				],
				accion: { label: 'Abrir mi perfil', ruta: '/profile' },
			},
			{
				index: 5,
				tipo: 'sidebar',
				titulo: 'Menú lateral',
				subtitulo: 'Navegación diaria',
				icon: '📋',
				spotlight: 'sidebar',
				modulo: '',
				menuNombre: '',
				menuKey: '',
				opciones: [],
				textoGuia:
					'El menú izquierdo muestra la **misma estructura** que el portal: módulos, menús y pantallas autorizadas.',
				tips: [
					'Ideal cuando ya conoce la pantalla que busca.',
					'En los siguientes pasos explicaremos **cada sección** de su menú.',
					'La sección activa se resaltará mientras avanza.',
					'Solo verá opciones con permiso de lectura.',
				],
			},
		];

		const grupos = this.groupByModuloMenu(opciones);
		let index = pasos.length;
		for (const grupo of grupos) {
			pasos.push({
				index,
				tipo: 'menu',
				titulo: grupo.modulo,
				subtitulo: grupo.menu,
				icon: this.iconoModulo(grupo.modulo),
				spotlight: 'sidebar',
				modulo: grupo.modulo,
				menuNombre: grupo.menu,
				menuKey: grupo.menuKey,
				opciones: grupo.opciones,
				textoGuia: this.buildTextoMenu(grupo.modulo, grupo.menu, grupo.opciones),
				tips: [`Menú **${grupo.menu}** del módulo **${grupo.modulo}**.`, 'Pulse una pantalla abajo para probarla.'],
			});
			index += 1;
		}

		pasos.push({
			index,
			tipo: 'cierre',
			titulo: '¡Listo para trabajar!',
			subtitulo: 'Fin del recorrido',
			icon: '🎉',
			spotlight: 'center',
			modulo: '',
			menuNombre: '',
			menuKey: '',
			opciones: [],
			textoGuia: 'Ya conoce el portal, favoritos, perfil y las secciones de su menú.',
			tips: [
				'Use el **portal** y **favoritos** para accesos rápidos.',
				'Use el **menú lateral** en el día a día.',
				'Vuelva a abrir la guía con **?** cuando lo necesite.',
				'¡Buen trabajo en SGUEES!',
			],
			accion: { label: 'Ir al portal', ruta: '/home' },
		});

		return pasos.map((p, i) => ({ ...p, index: i }));
	}

	private iconoModulo(modulo: string): string {
		const map: Record<string, string> = {
			Contabilidad: '📊',
			Compras: '🛒',
			'Caja y Bancos': '🏦',
			Seguridad: '🔐',
			Generales: '📁',
			'Talento Humano': '👥',
			Nómina: '💼',
		};
		return map[modulo] ?? '📌';
	}

	private groupByModuloMenu(
		opciones: AsistenteOpcion[]
	): { modulo: string; menu: string; menuKey: string; opciones: AsistenteOpcion[] }[] {
		const map = new Map<string, { modulo: string; menu: string; menuKey: string; opciones: AsistenteOpcion[] }>();

		for (const op of opciones) {
			const key = `${op.modulo}|${op.menu}|${op.menuKey}`;
			const entry = map.get(key) ?? {
				modulo: op.modulo,
				menu: op.menu,
				menuKey: op.menuKey,
				opciones: [],
			};
			entry.opciones.push(op);
			map.set(key, entry);
		}

		return [...map.values()].sort((a, b) =>
			`${a.modulo}|${a.menu}`.localeCompare(`${b.modulo}|${b.menu}`, 'es')
		);
	}

	private buildTextoMenu(modulo: string, menuNombre: string, opciones: AsistenteOpcion[]): string {
		const menuHint = resolveRecorridoMenuHint(modulo, menuNombre);
		const modHint = resolveRecorridoModuloHint(modulo);
		const intro =
			menuHint ||
			modHint ||
			`Pantallas operativas de **${menuNombre}** en **${modulo}** asignadas a su usuario.`;

		return intro;
	}

	private buildAiPrompt(paso: RecorridoPaso): string {
		const opcionesJson = JSON.stringify(paso.opciones.map((o) => ({ menu: paso.menuNombre, opcion: o.titulo })));

		return [
			'Eres guía de SGUEES (ERP). Responde en español, máximo 6 viñetas cortas.',
			'No inventes pantallas. No menciones rutas técnicas ni URLs.',
			`Paso: ${paso.titulo} — ${paso.subtitulo}`,
			paso.textoGuia,
			paso.tips.length ? `Tips: ${paso.tips.join(' ')}` : '',
			opcionesJson !== '[]' ? `Opciones: ${opcionesJson}` : '',
			'Explica en lenguaje de negocio de forma amigable.',
		]
			.filter(Boolean)
			.join('\n');
	}

	private setTourActive(active: boolean): void {
		document.body.classList.toggle('sguees-recorrido-activo', active);
	}

	private patch(partial: Partial<RecorridoGuiaState>): void {
		this.stateSubject.next({ ...this.snapshot, ...partial });
	}
}
