export interface ScSolicitudEmpleoToken {
	CORR_EMPRESA: number;
	CORR_TOKEN: number;
	CORR_SOLICITUD_EMPLEO: number;
	TOKEN_HASH: string;
	FECHA_GENERACION: Date;
	FECHA_EXPIRACION: Date;
	FECHA_UTILIZACION?: Date;
	ESTADO_TOKEN: string;
	CORREO_DESTINO: string;
}
