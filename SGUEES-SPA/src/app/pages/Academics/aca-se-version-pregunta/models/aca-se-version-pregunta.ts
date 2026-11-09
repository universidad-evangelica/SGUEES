// Qué hace: modelos TypeScript de ACA_SE_VERSION_PREGUNTA y lookups.
// Cómo lo hace: refleja V_ACA_SE_VERSION_PREGUNTA (rol/asoc. líquido por versión+sección).
export interface AcaSeVersionPregunta {
	CORR_VERSION_PREGUNTA: number;
	CORR_VERSION: number;
	CODIGO_VERSION?: string;
	NOMBRE_VERSION?: string;
	CORR_SECCION_SE: number;
	CODIGO_SECCION?: string;
	NOMBRE_SECCION?: string;
	TIPO_EVALUACION?: string;
	CORR_PREGUNTA: number;
	CODIGO_PREGUNTA?: string;
	ENUNCIADO_PREGUNTA?: string;
	CORR_TIPO_PREGUNTA?: number;
	CODIGO_TIPO_PREGUNTA?: string;
	NOMBRE_TIPO_PREGUNTA?: string;
	ORDEN: number;
	PUNTAJE: number;
	ES_REQUERIDO: boolean;
	ROL_MONTO?: string | null;
	NOMBRE_ROL_MONTO?: string | null;
	CORR_PREGUNTA_BRUTO?: number | null;
	CODIGO_PREGUNTA_BRUTO?: string | null;
	ENUNCIADO_PREGUNTA_BRUTO?: string | null;
	CORR_PREGUNTA_DESCUENTO?: number | null;
	CODIGO_PREGUNTA_DESCUENTO?: string | null;
	ENUNCIADO_PREGUNTA_DESCUENTO?: string | null;
	ACTIVO: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date | string;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date | string;
}

export interface AcaSeVersionLookup {
	CORR_VERSION: number;
	CODIGO: string;
	NOMBRE: string;
	DISPLAY?: string;
	ACTIVO?: boolean;
}

export interface AcaSeSeccionLookup {
	CORR_SECCION_SE: number;
	CORR_VERSION: number;
	CODIGO: string;
	NOMBRE_SECCION: string;
	TIPO_EVALUACION?: string;
	PORCENTAJE_MAXIMO?: number;
	DISPLAY?: string;
	ACTIVO?: boolean;
	ORDEN?: number;
}

export interface AcaSePreguntaLookup {
	CORR_PREGUNTA: number;
	CODIGO: string;
	ENUNCIADO: string;
	CORR_TIPO_PREGUNTA?: number;
	CODIGO_TIPO_PREGUNTA?: string;
	NOMBRE_TIPO_PREGUNTA?: string;
	DISPLAY?: string;
	ACTIVO?: boolean;
}

export interface AcaSeRolMontoLookup {
	Key: string;
	Value: string;
}

export interface AcaSePreguntaAsocLookup {
	CORR_PREGUNTA: number;
	CODIGO: string;
	ENUNCIADO: string;
	DISPLAY?: string;
}
