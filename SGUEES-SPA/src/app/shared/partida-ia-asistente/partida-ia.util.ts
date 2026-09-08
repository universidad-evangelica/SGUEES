import { AsistenteOpcion } from 'src/app/components/sguees-asistente/models/asistente-opcion.model';

const PARTIDA_RUTA_PREFIX = '/con-partida';

export function isPartidaOpcion(opcion: AsistenteOpcion): boolean {
	const ruta = (opcion.ruta || '').toLowerCase();
	const titulo = (opcion.titulo || '').toLowerCase();
	return ruta.startsWith(PARTIDA_RUTA_PREFIX) || titulo.includes('partida');
}

export function matchPartidaOpciones(pregunta: string, opciones: AsistenteOpcion[]): AsistenteOpcion[] {
	const texto = (pregunta || '').trim().toLowerCase();
	if (!texto) {
		return opciones.slice(0, 8);
	}

	const palabras = texto.split(/\s+/).filter((w) => w.length > 2);
	if (!palabras.length) {
		return opciones.slice(0, 8);
	}

	const scored = opciones
		.map((op) => {
			const haystack = `${op.titulo} ${op.menu} ${op.modulo} ${op.ruta}`.toLowerCase();
			const score = palabras.reduce((acc, w) => acc + (haystack.includes(w) ? 1 : 0), 0);
			return { op, score };
		})
		.filter((x) => x.score > 0)
		.sort((a, b) => b.score - a.score);

	return scored.slice(0, 6).map((x) => x.op);
}
