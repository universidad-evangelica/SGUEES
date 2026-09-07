/** Textos de guía por módulo y por menú (nombre visible en el árbol lateral). */
export const RECORRIDO_MODULO_HINTS: Record<string, string> = {
	Generales: 'Catálogos y tablas maestras compartidas por varios procesos del ERP.',
	Contabilidad: 'Partidas contables, catálogos, reportes y cierres del área contable.',
	Compras: 'Proveedores, cotizaciones, órdenes de compra y documentos del ciclo de compras.',
	'Caja y Bancos': 'Cheques, conciliación bancaria, solicitudes y movimientos de tesorería.',
	Seguridad: 'Usuarios, permisos, opciones de menú y flujos de autorización.',
	'Talento Humano': 'Selección, contratación, puestos y catálogos de recursos humanos.',
	Nómina: 'Puestos, tipos de puesto y procesos relacionados con planilla.',
};

export function resolveRecorridoModuloHint(modulo: string): string | null {
	return RECORRIDO_MODULO_HINTS[modulo] ?? null;
}

export function resolveRecorridoMenuHint(modulo: string, menu: string): string | null {
	const key = `${modulo}|${menu}`.toLowerCase();
	const hints: Record<string, string> = {
		'contabilidad|procesos':
			'Operaciones sobre partidas: registrar, aplicar, desaplicar, anular e imprimir.',
		'contabilidad|catálogos': 'Tablas de apoyo contable: cuentas, centros de costo, periodos, etc.',
		'contabilidad|reportes': 'Consultas e informes del módulo contable.',
		'compras|procesos': 'Documentos de compra, cotizaciones, cuadros comparativos y órdenes.',
		'compras|catálogos': 'Proveedores, condiciones de pago y parámetros de compras.',
		'caja y bancos|procesos': 'Cheques, solicitudes, conciliación y documentos bancarios.',
		'caja y bancos|catálogos': 'Cuentas bancarias, tipos de cheque y parámetros de bancos.',
		'seguridad|administración': 'Usuarios, roles, opciones del sistema y configuración de accesos.',
		'seguridad|flujos': 'Actores, tipos de documento y flujos de aprobación.',
		'generales|tablas generales': 'Catálogos transversales: bancos, divisiones, gerencias, etc.',
	};
	return hints[key] ?? null;
}
