import { Injectable } from '@angular/core';
import { AsistenteOpcion } from './models/asistente-opcion.model';
import { AsistenteScreenHint } from './asistente-screen-hints';

@Injectable({ providedIn: 'root' })
export class AsistentePromptService {
	buildOnboardingPrompt(params: {
		nombreUsuario: string;
		nombreEmpresa: string;
		opciones: AsistenteOpcion[];
	}): string {
		const menuJson = JSON.stringify(
			params.opciones.map((o) => ({
				modulo: o.modulo,
				menu: o.menu,
				opcion: o.titulo,
				ruta: o.ruta,
			})),
			null,
			0
		);

		return [
			'Eres el asistente de SGUEES (ERP). Responde en español claro, máximo 15 viñetas cortas.',
			'REGLAS: No inventes pantallas ni rutas. Usa SOLO las opciones del JSON.',
			'Si un módulo no tiene opciones en el JSON, no lo menciones.',
			`Usuario: ${params.nombreUsuario || 'usuario'}`,
			`Empresa: ${params.nombreEmpresa || '—'}`,
			'Opciones asignadas al usuario (JSON):',
			menuJson,
			'Tarea: Da un recorrido general del sistema para este usuario. Agrupa por módulo y menú. Explica para qué sirve cada grupo en lenguaje de negocio. Cierra invitando a usar el listado de la izquierda para abrir cada pantalla.',
		].join('\n');
	}

	buildScreenPrompt(params: {
		nombreUsuario: string;
		ruta: string;
		hint: AsistenteScreenHint | null;
		permiso: string;
		pregunta?: string;
	}): string {
		const hintBlock = params.hint
			? `Pantalla: ${params.hint.titulo}\nDescripción: ${params.hint.descripcion}`
			: `Pantalla (ruta): ${params.ruta}\nDescripción: Sin ficha curada; explica solo de forma genérica que es una pantalla operativa del ERP.`;

		const lines = [
			'Eres el asistente de SGUEES. Responde en español, breve y práctico.',
			'REGLAS: No inventes botones, campos ni procesos que no estén en la descripción.',
			`Usuario: ${params.nombreUsuario || 'usuario'}`,
			hintBlock,
			`Permiso del usuario en esta ruta (CRUDP): ${params.permiso || '—'}`,
		];

		if (params.pregunta?.trim()) {
			lines.push(`Pregunta del usuario: ${params.pregunta.trim()}`);
		} else {
			lines.push('Tarea: Explica qué puede hacer el usuario en esta pantalla y por dónde empezar.');
		}

		return lines.join('\n');
	}

	buildFreeQuestionPrompt(params: {
		nombreUsuario: string;
		opciones: AsistenteOpcion[];
		pregunta: string;
	}): string {
		const menuResumen = params.opciones
			.slice(0, 80)
			.map((o) => `- [${o.modulo} / ${o.menu}] ${o.titulo} (${o.ruta})`)
			.join('\n');

		return [
			'Eres el asistente de SGUEES. Responde en español.',
			'Solo responde sobre el ERP y las opciones listadas. Si no sabes, dilo.',
			`Usuario: ${params.nombreUsuario}`,
			'Opciones disponibles para este usuario:',
			menuResumen,
			`Pregunta: ${params.pregunta.trim()}`,
		].join('\n');
	}
}
