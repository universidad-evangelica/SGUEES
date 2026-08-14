// Qué hace: define usuarios del browse, asignaciones y unidades del modal.
// Cómo: tipa los datos provenientes de los lookups y de V_SC_UNIDADES_USUARIO.
export interface ScUnidadesUsuarioBrowse {
	LOGIN_SISTEMA: string;
	NOMBRE_USUARIO: string;
	CANT_UNIDADES: number;
	ESTADO_USUARIO?: number;
}

export interface ScUnidadesUsuario {
	CORR_EMPRESA: number;
	CORR_UNIDAD: number | null;
	CODIGO_UNIDAD?: string | null;
	NOMBRE_UNIDAD?: string | null;
	LOGIN_SISTEMA: string;
	NOMBRE_USUARIO?: string | null;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date | string;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date | string;
}

export interface ScUnidadLookupItem {
	CORR_UNIDAD: number;
	CODIGO_UNIDAD?: string;
	NOMBRE_UNIDAD: string;
	ACTIVO?: boolean;
}

// Qué hace: representa una unidad seleccionable en el popup.
// Cómo: amplía el catálogo con el checkbox SELECCION.
export interface ScUnidadAsignarItem extends ScUnidadLookupItem {
	SELECCION: boolean;
}
