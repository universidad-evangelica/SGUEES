export interface ScExpedienteCandidato {
	CORR_EMPRESA: number;
	CORR_EXPEDIENTE_CANDIDATO: number;
	CORR_PERSONA_DATOS: number;
	FECHA_GENERACION: Date | string;
	ACTIVO: boolean;
	DUI_PERSONA?: string;
	NOMBRE_PERSONA?: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date | string;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date | string;
}
