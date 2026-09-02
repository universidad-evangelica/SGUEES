export interface ScExpedienteEntrevistaDocumento {
	CORR_EMPRESA: number;
	CORR_EXPEDIENTE_CANDIDATO: number;
	CORR_EXPEDIENTE_ENTREVISTA: number;
	CORR_ENTREVISTA_DOCUMENTO: number;
	FECHA_CARGA: Date | string;
	NOMBRE_ARCHIVO: string;
	RUTA_ARCHIVO?: string;
	NOTAS?: string;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date | string;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date | string;
}
