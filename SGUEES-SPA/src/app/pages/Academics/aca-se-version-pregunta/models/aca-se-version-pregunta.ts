// Qué hace: modelos TypeScript de ACA_SE_VERSION_PREGUNTA y lookups.
// Cómo lo hace: refleja V_ACA_SE_VERSION_PREGUNTA y los GetLookUp de versión/pregunta.
export interface AcaSeVersionPregunta {
	CORR_VERSION_PREGUNTA: number;
	CORR_VERSION: number;
	CODIGO_VERSION?: string;
	NOMBRE_VERSION?: string;
	CORR_PREGUNTA: number;
	CODIGO_PREGUNTA?: string;
	ENUNCIADO_PREGUNTA?: string;
	ORDEN: number;
	ES_REQUERIDO: boolean;
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
	ACTIVO?: boolean;
}

export interface AcaSePreguntaLookup {
	CORR_PREGUNTA: number;
	CODIGO: string;
	ENUNCIADO: string;
	ACTIVO?: boolean;
}
