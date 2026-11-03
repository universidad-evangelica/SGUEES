// Qué hace: modelos TypeScript de ACA_SE_PUNTAJE y lookups de pregunta/opción.
// Cómo lo hace: refleja V_ACA_SE_PUNTAJE y GetLookUp GetCORR_PREGUNTA / GetCORR_OPCION.
export interface AcaSePuntaje {
	CORR_PUNTAJE: number;
	CORR_PREGUNTA: number;
	CODIGO_PREGUNTA?: string;
	ENUNCIADO_PREGUNTA?: string;
	CORR_OPCION?: number | null;
	CODIGO_OPCION?: string;
	TEXTO_OPCION?: string;
	PUNTAJE: number;
	PORCENTAJE: number;
	FECHA_INICIO: Date | string;
	FECHA_FIN?: Date | string | null;
	ACTIVO: boolean;
	CORR_EMPRESA?: number;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date | string;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date | string;
}

export interface AcaSePreguntaLookup {
	CORR_PREGUNTA: number;
	CODIGO: string;
	ENUNCIADO: string;
	ACTIVO?: boolean;
}

export interface AcaSeOpcionLookup {
	CORR_OPCION: number;
	CORR_PREGUNTA: number;
	CODIGO: string;
	TEXTO: string;
	ACTIVO?: boolean;
}
