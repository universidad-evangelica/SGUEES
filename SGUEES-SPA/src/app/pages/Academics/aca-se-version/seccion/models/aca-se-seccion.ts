// Qué hace: modelo TypeScript de sección SE por versión.
// Cómo lo hace: refleja V_ACA_SE_SECCION (incluye TIPO_EVALUACION).
export interface AcaSeSeccion {
	CORR_SECCION_SE: number;
	CORR_VERSION: number;
	CODIGO_VERSION?: string;
	NOMBRE_VERSION?: string;
	CODIGO: string;
	NOMBRE_SECCION: string;
	DESCRIPCION?: string | null;
	ORDEN: number;
	PORCENTAJE_MAXIMO: number;
	TIPO_EVALUACION: string;
	ACTIVO: boolean;
	CORR_EMPRESA?: number;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date | string;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date | string;
}

export interface AcaSeTipoEvaluacionLookup {
	Key: string;
	Value: string;
}
