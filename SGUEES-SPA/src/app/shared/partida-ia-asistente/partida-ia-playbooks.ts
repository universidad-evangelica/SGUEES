import { PartidaIaContexto } from './partida-ia.models';

export interface PartidaFlujoPaso {
	orden: number;
	titulo: string;
	ruta: string;
	descripcion: string;
}

export interface PartidaGuiaResuelta {
	tituloPantalla: string;
	/** Texto principal — instantáneo, sin IA */
	resumen: string;
	/** Pasos concretos solo de ESTA pantalla */
	pasosEnPantalla: string[];
	/** Nota según estado del registro (si aplica) */
	notaEstado?: string;
	/** Un solo siguiente paso recomendado */
	siguiente?: {
		titulo: string;
		ruta: string;
		motivo: string;
	};
	/** Flujo contable lineal (referencia, no mezcla acciones) */
	flujo: PartidaFlujoPaso[];
	/** Índice del paso actual en el flujo (0-based) */
	flujoIndiceActual: number;
}

const FLUJO_PARTIDAS: PartidaFlujoPaso[] = [
	{
		orden: 1,
		titulo: 'Partidas contables',
		ruta: '/con-partida',
		descripcion: 'Crear, editar y cuadrar partidas en estado digitada (DI).',
	},
	{
		orden: 2,
		titulo: 'Aplicar partidas',
		ruta: '/con-partida-aplicar',
		descripcion: 'Contabilizar en libro mayor las partidas DI cuadradas.',
	},
	{
		orden: 3,
		titulo: 'Des-aplicar partidas',
		ruta: '/con-partida-desaplicar',
		descripcion: 'Revertir a digitada una partida aplicada para corregirla.',
	},
	{
		orden: 4,
		titulo: 'Anular partidas',
		ruta: '/con-partida-anular',
		descripcion: 'Cancelar definitivamente partidas que no deben contabilizarse.',
	},
];

function indiceFlujo(ruta: string): number {
	const i = FLUJO_PARTIDAS.findIndex((p) => p.ruta === ruta);
	return i >= 0 ? i : 0;
}

function notaEstadoPartida(ctx: PartidaIaContexto): string | undefined {
	const codigo = (ctx.estadoPartida || '').toUpperCase();
	if (!codigo || ctx.modoPantalla === 'grid') {
		return undefined;
	}
	const nombre = ctx.nombreEstadoPartida ? ` (${ctx.nombreEstadoPartida})` : '';

	if (codigo === 'DI') {
		return `Esta partida está DIGITADA${nombre}. Puede modificarla aquí. Cuando el detalle cuadre, el siguiente paso es Aplicar partidas.`;
	}
	if (codigo === 'AP') {
		return `Esta partida está APLICADA${nombre}. No se edita en esta pantalla. Para corregirla use Des-aplicar partidas y luego vuelva a editar.`;
	}
	if (codigo === 'AN') {
		return `Esta partida está ANULADA${nombre}. No se edita ni se aplica.`;
	}
	return `Estado actual: ${codigo}${nombre}.`;
}

function guiaConPartida(ctx: PartidaIaContexto): Omit<PartidaGuiaResuelta, 'flujo' | 'flujoIndiceActual'> {
	const enGrid = ctx.modoPantalla === 'grid';
	const estado = (ctx.estadoPartida || '').toUpperCase();

	if (enGrid) {
		return {
			tituloPantalla: 'Partidas contables',
			resumen:
				'Pantalla principal de partidas. Aquí consulta por fechas, crea nuevas partidas y abre las digitadas para editar.',
			pasosEnPantalla: [
				'Ajuste el rango de fechas y pulse Consultar.',
				'Nuevo: crea una partida en estado digitada (DI).',
				'Doble clic en una fila: abre encabezado, detalle contable y documentos de soporte.',
				'Solo las partidas DI se pueden modificar.',
			],
			siguiente: {
				titulo: 'Aplicar partidas',
				ruta: '/con-partida-aplicar',
				motivo: 'Cuando tenga partidas DI cuadradas, vaya allí para contabilizarlas.',
			},
		};
	}

	if (estado === 'DI') {
		return {
			tituloPantalla: 'Partidas contables — edición',
			resumen: 'Está editando una partida digitada. Complete encabezado, líneas del detalle (cuenta, centro, débito/crédito) y documentos si aplica.',
			pasosEnPantalla: [
				'Verifique que débitos y créditos cuadren en el detalle.',
				'Guarde los cambios antes de salir.',
				'Imprima PDF o importe Excel desde la barra si lo necesita.',
				'No aplique desde aquí; use la pantalla Aplicar partidas.',
			],
			notaEstado: notaEstadoPartida(ctx),
			siguiente: {
				titulo: 'Aplicar partidas',
				ruta: '/con-partida-aplicar',
				motivo: 'Al terminar y cuadrar la partida, el siguiente paso es aplicarla.',
			},
		};
	}

	if (estado === 'AP') {
		return {
			tituloPantalla: 'Partidas contables — consulta',
			resumen: 'Partida aplicada: la pantalla está en solo lectura. Ya fue contabilizada.',
			pasosEnPantalla: [
				'Revise encabezado, detalle y documentos de soporte.',
				'Puede imprimir PDF desde la barra.',
				'Para modificar debe des-aplicarla primero.',
			],
			notaEstado: notaEstadoPartida(ctx),
			siguiente: {
				titulo: 'Des-aplicar partidas',
				ruta: '/con-partida-desaplicar',
				motivo: 'Para corregir una partida aplicada, des-aplique y vuelva a editar en esta pantalla.',
			},
		};
	}

	if (estado === 'AN') {
		return {
			tituloPantalla: 'Partidas contables — consulta',
			resumen: 'Partida anulada: no se edita ni se vuelve a aplicar.',
			pasosEnPantalla: ['Consulte los datos con fines de auditoría.', 'Use Imprimir si necesita respaldo.'],
			notaEstado: notaEstadoPartida(ctx),
		};
	}

	return {
		tituloPantalla: 'Partidas contables',
		resumen: 'Mantenimiento de partidas contables según su permiso.',
		pasosEnPantalla: ['Consulte el listado o edite una partida digitada.'],
		notaEstado: notaEstadoPartida(ctx),
	};
}

function guiaProceso(modo: string): Omit<PartidaGuiaResuelta, 'flujo' | 'flujoIndiceActual'> {
	if (modo === 'aplicar') {
		return {
			tituloPantalla: 'Aplicar partidas',
			resumen:
				'Proceso para contabilizar partidas digitadas y cuadradas. No edita partidas aquí.',
			pasosEnPantalla: [
				'Defina rango de fechas y Consultar.',
				'Revise el listado; doble clic para ver detalle.',
				'Seleccione y ejecute Aplicar.',
				'Si una partida no aparece, verifique que esté DI y cuadrada en Partidas contables.',
			],
			siguiente: {
				titulo: 'Partidas contables',
				ruta: '/con-partida',
				motivo: 'Si necesita corregir datos antes de aplicar, regrese a editar la partida.',
			},
		};
	}

	if (modo === 'desaplicar') {
		return {
			tituloPantalla: 'Des-aplicar partidas',
			resumen: 'Revierte partidas aplicadas a digitada para permitir corrección.',
			pasosEnPantalla: [
				'Filtre por fechas y Consultar.',
				'Seleccione partidas aplicadas a revertir.',
				'Ejecute Des-aplicar.',
				'Luego edite en Partidas contables y vuelva a Aplicar partidas.',
			],
			siguiente: {
				titulo: 'Partidas contables',
				ruta: '/con-partida',
				motivo: 'Después de des-aplicar, edite la partida aquí.',
			},
		};
	}

	return {
		tituloPantalla: 'Anular partidas',
		resumen: 'Cancela partidas de forma definitiva. No es lo mismo que des-aplicar.',
		pasosEnPantalla: [
			'Filtre por fechas y Consultar.',
			'Seleccione las partidas a anular.',
			'Ejecute Anular.',
			'Las partidas anuladas ya no se editan ni aplican.',
		],
		siguiente: {
			titulo: 'Partidas contables',
			ruta: '/con-partida',
			motivo: 'Para consultar partidas anuladas o crear nuevas, use el mantenimiento.',
		},
	};
}

export function resolvePartidaGuia(ruta: string, ctx: PartidaIaContexto): PartidaGuiaResuelta {
	const flujoIndiceActual = indiceFlujo(ruta);
	let base: Omit<PartidaGuiaResuelta, 'flujo' | 'flujoIndiceActual'>;

	if (ctx.modoPantalla === 'proceso' && ctx.operacionModo) {
		base = guiaProceso(ctx.operacionModo);
	} else if (ruta === '/con-partida') {
		base = guiaConPartida(ctx);
	} else if (ruta === '/con-partida-aplicar') {
		base = guiaProceso('aplicar');
	} else if (ruta === '/con-partida-desaplicar') {
		base = guiaProceso('desaplicar');
	} else if (ruta === '/con-partida-anular') {
		base = guiaProceso('anular');
	} else {
		base = guiaConPartida(ctx);
	}

	return {
		...base,
		flujo: FLUJO_PARTIDAS,
		flujoIndiceActual,
	};
}

export function puedeIrARuta(ruta: string, permisoFn: (ruta: string) => string): boolean {
	const permiso = permisoFn(ruta) || '';
	return permiso.includes('R');
}
