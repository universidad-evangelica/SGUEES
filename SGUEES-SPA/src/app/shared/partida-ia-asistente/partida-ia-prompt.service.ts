import { Injectable } from '@angular/core';
import { AsistenteOpcion } from 'src/app/components/sguees-asistente/models/asistente-opcion.model';
import { AsistenteScreenHint } from 'src/app/components/sguees-asistente/asistente-screen-hints';
import { PartidaIaContexto } from './partida-ia.models';

@Injectable({ providedIn: 'root' })
export class PartidaIaPromptService {
	buildScreenPrompt(params: {
		nombreUsuario: string;
		ruta: string;
		hint: AsistenteScreenHint | null;
		permiso: string;
		contexto: PartidaIaContexto;
		pregunta?: string;
	}): string {
		const hintBlock = params.hint
			? `Pantalla: ${params.hint.titulo}\nDescripción curada: ${params.hint.descripcion}`
			: `Pantalla (ruta): ${params.ruta}\nDescripción: Pantalla operativa de partidas contables.`;

		const ctx = params.contexto || {};
		const contextLines: string[] = [];
		if (ctx.modoPantalla) {
			contextLines.push(`Vista actual: ${ctx.modoPantalla}`);
		}
		if (ctx.operacionModo) {
			contextLines.push(`Proceso: ${ctx.operacionModo}`);
		}
		if (ctx.estadoPartida) {
			contextLines.push(
				`Estado partida: ${ctx.estadoPartida}${ctx.nombreEstadoPartida ? ` (${ctx.nombreEstadoPartida})` : ''}`
			);
		}
		if (ctx.corrPartida != null && ctx.corrPartida !== '') {
			contextLines.push(`Número partida en pantalla: ${ctx.corrPartida}`);
		}
		if (ctx.modoPantalla === 'formulario' && ctx.estadoPartida === 'DI') {
			contextLines.push(
				'Nota negocio: en estado digitada (DI) puede editar encabezado, detalle contable y documentos de soporte.'
			);
		}
		if (ctx.modoPantalla === 'formulario' && ctx.estadoPartida && ctx.estadoPartida !== 'DI') {
			contextLines.push('Nota negocio: partida no digitada; la pantalla suele estar en solo lectura.');
		}

		const lines = [
			'Eres el asistente de partidas contables en SGUEES. Responde en español, breve y práctico (máx. 10 viñetas cortas).',
			'REGLAS: No inventes botones, campos ni procesos fuera de la descripción curada y el contexto.',
			'Usa lenguaje de contador/administrativo, no técnico.',
			`Usuario: ${params.nombreUsuario || 'usuario'}`,
			hintBlock,
			`Permiso CRUDP en esta pantalla: ${params.permiso || '—'}`,
		];

		if (contextLines.length) {
			lines.push('Contexto en pantalla:', ...contextLines.map((l) => `- ${l}`));
		}

		if (params.pregunta?.trim()) {
			lines.push(`Pregunta del usuario: ${params.pregunta.trim()}`);
		} else {
			lines.push('Tarea: Explica qué puede hacer el usuario aquí y el flujo recomendado paso a paso.');
		}

		return lines.join('\n');
	}

	buildWherePrompt(params: {
		nombreUsuario: string;
		rutaActual: string;
		opciones: AsistenteOpcion[];
		pregunta: string;
	}): string {
		const menuResumen = params.opciones
			.map((o) => `- ${o.titulo} → ${o.ruta} (${o.modulo} / ${o.menu})`)
			.join('\n');

		return [
			'Eres el asistente de partidas contables en SGUEES. Responde en español, claro y breve (máx. 6 líneas).',
			'REGLAS ESTRICTAS:',
			'- Solo puedes recomendar pantallas del listado siguiente.',
			'- Si ninguna coincide, dilo y sugiere revisar permisos con el administrador.',
			'- No inventes rutas ni nombres de pantalla.',
			'- Menciona el nombre de pantalla tal como aparece en el listado.',
			`Usuario: ${params.nombreUsuario || 'usuario'}`,
			`Pantalla donde está ahora: ${params.rutaActual}`,
			'Pantallas de partidas disponibles para este usuario:',
			menuResumen || '(ninguna con permiso de lectura)',
			`Pregunta: ${params.pregunta.trim()}`,
			'Tarea: Indica en qué pantalla del listado debe ir y qué hará allí.',
		].join('\n');
	}
}
