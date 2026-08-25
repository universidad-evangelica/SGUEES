export interface ScExpedienteSolicitud {
	CORR_EMPRESA: number;
	CORR_EXPEDIENTE_CANDIDATO: number;
	CORR_EXPEDIENTE_SOLICITUD: number;
	CORR_SOLICITUD_EMPLEO: number;
	FECHA_SOLICITUD?: Date | string;
	CORREO_INVITACION?: string;
	DUI_SOLICITUD?: string;
	NOMBRE_SOLICITUD?: string;
	CORR_TIPO_CONTRATACION?: number;
	NOMBRE_TIPO_CONTRATACION?: string;
	CORR_PERSONA_DATOS?: number;
	ACTIVO_SOLICITUD?: boolean;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date | string;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date | string;
}
