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
			'Mantenimiento de partidas: crear, editar, aplicar, imprimir PDF. Incluye encabezado, detalle contable, documentos de soporte y operaciones según estado (digitada, aplicada, anulada).',
	},
	'/con-partida-aplicar': {
		titulo: 'Aplicar partidas',
		descripcion: 'Proceso masivo para aplicar partidas contables digitadas y cuadradas en un rango de fechas.',
	},
	'/con-partida-desaplicar': {
		titulo: 'Des-aplicar partidas',
		descripcion: 'Revierte partidas aplicadas dentro del periodo y filtros seleccionados.',
	},
	'/con-partida-anular': {
		titulo: 'Anular partidas',
		descripcion: 'Anula partidas según criterios de búsqueda; operación de proceso contable.',
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
