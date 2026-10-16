// Qué hace: modelo TypeScript de parámetros SMTP.
// Cómo lo hace: define los campos de configuración de servidor de correo y auditoría para la grilla y formulario.
export interface GenParametroSmtp {
	CORR_EMPRESA: number;
	CORR_PARAMETRO_SMTP: number;
	CORREO_REMITENTE: string;
	USUARIO_REMITENTE: string;
	CONTRASENA_REMITENTE: string;
	SERVIDOR_CORREO: string;
	PUERTO_CORREO: number;
	USA_SSL_CORREO: boolean;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date;
}
