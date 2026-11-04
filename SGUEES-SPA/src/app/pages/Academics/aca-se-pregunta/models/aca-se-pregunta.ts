// Qué hace: modelos TypeScript de ACA_SE_PREGUNTA y lookup de tipo.
// Cómo lo hace: refleja V_ACA_SE_PREGUNTA y el select de GEN_SE_TIPO_PREGUNTA.
export interface AcaSePregunta {
	CORR_PREGUNTA: number;
	CORR_TIPO_PREGUNTA: number;
	CODIGO_TIPO_PREGUNTA?: string;
	NOMBRE_TIPO_PREGUNTA?: string;
	CODIGO: string;
	ENUNCIADO: string;
	AYUDA: string;
	ACTIVO: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date | string;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date | string;
}

// Qué hace: fila del GetLookUp GetCORR_TIPO_PREGUNTA (GEN_SE_TIPO_PREGUNTA).
export interface AcaSeTipoPreguntaLookup {
	CORR_TIPO_PREGUNTA: number;
	CODIGO: string;
	NOMBRE: string;
	ACTIVO?: boolean;
}
