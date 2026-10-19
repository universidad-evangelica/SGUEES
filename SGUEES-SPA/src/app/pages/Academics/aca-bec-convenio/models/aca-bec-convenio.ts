export interface AcaBecConvenio {
	CORR_EMPRESA?: number;
	CORR_CONVENIO: number;
	CODIGO_CONVENIO: string;
	NOMBRE_CONVENIO: string;
	CORR_ENTIDAD_FINANCIADORA: number;
	CODIGO_ENTIDAD?: string;
	NOMBRE_ENTIDAD?: string;
	TIPO_ENTIDAD?: string;
	FECHA_INICIO: Date | string;
	FECHA_FIN?: Date | string | null;
	DESCRIPCION?: string | null;
	ESTADO_CONVENIO: string;
	ACTIVO?: boolean;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date | string;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date | string;
}

export interface AcaBecEntidadFinanciadoraLookup {
	CORR_ENTIDAD_FINANCIADORA: number;
	CODIGO_ENTIDAD: string;
	NOMBRE_ENTIDAD: string;
	TIPO_ENTIDAD: string;
	ACTIVO?: boolean;
}

