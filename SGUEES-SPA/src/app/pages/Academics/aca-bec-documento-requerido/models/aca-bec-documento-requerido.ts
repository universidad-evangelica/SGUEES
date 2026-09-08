export interface AcaBecDocumentoRequerido {
	CORR_EMPRESA?: number;
	CORR_BECA_DOCUMENTO_REQUERIDO: number;
	CORR_BECA: number;
	CODIGO_BECA?: string;
	NOMBRE_BECA?: string;
	NOMBRE_DOCUMENTO: string;
	AREA_RECEPTORA: string;
	OBLIGATORIO: boolean;
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
