export interface ScExpedienteEntrevista {
	CORR_EMPRESA: number;
	CORR_EXPEDIENTE_CANDIDATO: number;
	CORR_EXPEDIENTE_ENTREVISTA: number;
	CORR_SOLICITUD_EMPLEO: number;
	TIPO_ENTREVISTA: string;
	FECHA_ENTREVISTA: Date | string;
	ENTREVISTADOR: string;
	ESTADO_ENTREVISTA: string;
	RESULTADO_ENTREVISTA?: string;
	RESUMEN_ENTREVISTA?: string;
	CORREO_INVITACION?: string;
	NOMBRE_SOLICITUD?: string;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date | string;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date | string;
}
