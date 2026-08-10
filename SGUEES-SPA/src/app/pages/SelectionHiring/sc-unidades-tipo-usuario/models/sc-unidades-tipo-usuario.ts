// Qué hace: modelos de unidades por tipo de usuario (rol) y lookup de organigrama.
// Cómo: define el rol con contador, la asignación intermedia y el ítem de catálogo de unidades.
export interface ScUnidadesTipoUsuarioRol {
	TIPO_USUARIO: number;
	NOMBRE_TIPO_USUARIO: string;
	CANT_UNIDADES: number;
}

export interface ScUnidadesTipoUsuario {
	CORR_EMPRESA: number;
	CORR_UNIDAD: number | null;
	CODIGO_UNIDAD?: string | null;
	NOMBRE_UNIDAD?: string | null;
	TIPO_USUARIO: number;
	NOMBRE_TIPO_USUARIO?: string | null;
	ACTIVO?: boolean | null;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date | string;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date | string;
	_clientKey?: string;
}

export interface ScUnidadLookupItem {
	CORR_UNIDAD: number;
	CODIGO_UNIDAD?: string;
	NOMBRE_UNIDAD: string;
	ACTIVO?: boolean;
}
