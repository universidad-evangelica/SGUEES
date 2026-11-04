// Qué hace: modelos TypeScript de ACA_SE_OPCION y lookup de pregunta.
// Cómo lo hace: refleja V_ACA_SE_OPCION y GetLookUp GetCORR_PREGUNTA (con tipo).
export interface AcaSeOpcion {
	CORR_OPCION: number;
	CORR_PREGUNTA: number;
	CODIGO_PREGUNTA?: string;
	ENUNCIADO_PREGUNTA?: string;
	CORR_TIPO_PREGUNTA?: number;
	CODIGO_TIPO_PREGUNTA?: string;
	NOMBRE_TIPO_PREGUNTA?: string;
	CODIGO: string;
	TEXTO: string;
	ORDEN: number;
	PUNTAJE: number;
	ACTIVO: boolean;
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
	CORR_TIPO_PREGUNTA?: number;
	CODIGO_TIPO_PREGUNTA?: string;
	NOMBRE_TIPO_PREGUNTA?: string;
	ACTIVO?: boolean;
}
