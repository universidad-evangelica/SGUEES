export interface AsistenteScreenHint {
	titulo: string;
	descripcion: string;
}

/** Textos curados por ruta SPA (fuente de verdad; la IA solo redacta). */
export const ASISTENTE_SCREEN_HINTS: Record<string, AsistenteScreenHint> = {
	'/home': {
		titulo: 'Inicio',
		descripcion:
			'Portal principal. Muestra los módulos y opciones a los que tiene acceso según su perfil. Desde aquí puede entrar a Contabilidad, Compras, General, etc.',
	},
	'/con-partida': {
		titulo: 'Partidas contables',
		descripcion:
			'Mantenimiento de partidas contables. En el listado consulta por fechas, crea nuevas partidas y edita las digitadas (DI). ' +
			'En edición: encabezado (periodo, clase, concepto), detalle contable (cuenta, centro de costo, débito/crédito) y documentos de soporte. ' +
			'Partidas aplicadas o anuladas quedan en solo lectura. Desde la barra puede imprimir PDF, importar Excel, crear modelo o generar desde modelo. ' +
			'Para contabilizar en libro mayor use el proceso Aplicar partidas cuando la partida esté cuadrada.',
	},
	'/con-partida-aplicar': {
		titulo: 'Aplicar partidas',
		descripcion:
			'Proceso masivo para aplicar partidas digitadas (DI) y cuadradas. Filtre por rango de fechas, consulte el listado, ' +
			'revise el detalle en doble clic y ejecute Aplicar. Solo partidas válidas pasan a estado aplicado (AP).',
	},
	'/con-partida-desaplicar': {
		titulo: 'Des-aplicar partidas',
		descripcion:
			'Revierte partidas aplicadas (AP) a digitadas dentro del rango de fechas. Consulte, seleccione y ejecute Des-aplicar. ' +
			'Use cuando deba corregir una partida ya contabilizada antes de volver a aplicar.',
	},
	'/con-partida-anular': {
		titulo: 'Anular partidas',
		descripcion:
			'Anula partidas según filtros de fecha. Consulte el listado y ejecute Anular sobre los registros elegibles. ' +
			'Operación de proceso contable; las partidas anuladas no se editan ni aplican.',
	},
	'/con-catalogo-cuenta': {
		titulo: 'Catálogo de cuentas',
		descripcion: 'Catálogo contable de cuentas por empresa; consulta y mantenimiento según permisos.',
	},
	'/con-periodo-contable': {
		titulo: 'Períodos contables',
		descripcion: 'Consulta y administración de periodos contables por año y mes.',
	},
	'/con-reporte-gastos': {
		titulo: 'Reporte de gastos',
		descripcion: 'Consulta de reporte de gastos con filtros; exportación a Excel desde la grilla.',
	},
	'/com-documento': {
		titulo: 'Documentos de compra',
		descripcion: 'Documentos de compras con encabezado, detalle, estados y flujo de aprobación.',
	},
	'/com-proveedor': {
		titulo: 'Proveedores',
		descripcion: 'Catálogo de proveedores para el módulo de compras.',
	},
	'/gen-banco': {
		titulo: 'Bancos',
		descripcion: 'Catálogo general de bancos.',
	},
};

export function resolveScreenHint(route: string): AsistenteScreenHint | null {
	const path = (route || '').split('?')[0].split('#')[0];
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return ASISTENTE_SCREEN_HINTS[normalized] ?? null;
}
