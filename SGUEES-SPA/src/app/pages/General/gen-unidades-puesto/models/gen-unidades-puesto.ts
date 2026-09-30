// Qué hace: modelos de puestos por unidad (organigrama) y lookup de puestos.
// Cómo: define la unidad con contador, la asignación intermedia y el ítem de catálogo de puestos.
export interface GenUnidadesPuestoUnidad {
	CORR_UNIDAD: number;
	CODIGO_UNIDAD?: string;
	NOMBRE_UNIDAD: string;
	CANT_PUESTOS: number;
	ACTIVO?: boolean;
}

export interface GenUnidadesPuesto {
	CORR_EMPRESA: number;
	CORR_UNIDAD: number;
	CODIGO_UNIDAD?: string | null;
	NOMBRE_UNIDAD?: string | null;
	CORR_PUESTO: number | null;
	CODIGO_PUESTO?: string | null;
	NOMBRE_PUESTO?: string | null;
	CORR_TIPO_PUESTO?: number | null;
	NOMBRE_TIPO_PUESTO?: string | null;
	ACTIVO_PUESTO?: boolean | null;
	MISION_PUESTO?: string | null;
	ESTADO_PUESTO?: string;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date | string;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date | string;
	_clientKey?: string;
}

export interface GenPuestoLookupItem {
	CORR_PUESTO: number;
	CODIGO_PUESTO?: string;
	NOMBRE_PUESTO: string;
	ACTIVO_PUESTO?: boolean;
}

// Qué hace: ítem del modal de asignación (catálogo + checkbox).
export interface GenPuestoAsignarItem extends GenPuestoLookupItem {
	SELECCION: boolean;
}
