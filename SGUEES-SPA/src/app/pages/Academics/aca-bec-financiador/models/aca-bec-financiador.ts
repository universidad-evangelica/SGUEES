export interface AcaBecFinanciador {
	CORR_EMPRESA?: number;
	CORR_BECA_FINANCIADOR: number;
	CORR_BECA: number;
	CODIGO_BECA?: string;
	NOMBRE_BECA?: string;
	CORR_ENTIDAD_FINANCIADORA: number;
	CODIGO_ENTIDAD?: string;
	NOMBRE_ENTIDAD?: string;
	TIPO_ENTIDAD?: string;
	CONCEPTO_COBERTURA: string;
	PORCENTAJE_COBERTURA: number;
	MONTO_MAXIMO?: number | null;
	ACTIVO: boolean;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date | string;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date | string;
}

export interface AcaBecTipoLookup {
	CORR_BECA: number;
	CODIGO_BECA: string;
	NOMBRE_BECA: string;
	ESTADO_BECA?: string;
	ACTIVO?: boolean;
}

export interface AcaBecEntidadFinanciadoraLookup {
	CORR_ENTIDAD_FINANCIADORA: number;
	CODIGO_ENTIDAD: string;
	NOMBRE_ENTIDAD: string;
	TIPO_ENTIDAD?: string;
	ACTIVO?: boolean;
}
