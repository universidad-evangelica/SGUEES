export interface GenBanco {
	CORR_EMPRESA: number;
	CORR_BANCO: number;
	NOMBRE_BANCO: string;
	NOMBRE_BANCO_CORTO: string;
	CLASE_BANCO: string;
	CODIGO_TRANSACION_UNI: string;
	ESTADO_BANCO: boolean;
	NOMBRE_CLASE_BANCO?: string;
	USUARIO_CREA?: string;
	FECHA_CREA?: Date;
	ESTACION_CREA?: string;
	USUARIO_ACTU?: string;
	FECHA_ACTU?: Date;
	ESTACION_ACTU?: string;
}
