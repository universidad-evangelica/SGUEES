export interface ScExpedienteDocumento {
	CORR_EMPRESA: number;
	CORR_EXPEDIENTE_CANDIDATO: number;
	CORR_EXPEDIENTE_DOCUMENTO: number;
	CORR_SOLICITUD_EMPLEO: number;
	FECHA_CARGA: Date | string;
	TIPO_DOCUMENTO: string;
	NOMBRE_ARCHIVO: string;
	RUTA_ARCHIVO?: string;
	NOTAS?: string;
	CORREO_INVITACION?: string;
	NOMBRE_SOLICITUD?: string;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date | string;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date | string;
}
