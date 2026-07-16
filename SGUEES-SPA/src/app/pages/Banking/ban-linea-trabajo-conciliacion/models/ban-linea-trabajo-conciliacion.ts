export interface BanLineaTrabajoConciliacion {
	CORR_EMPRESA: number;
	CORR_LINEA: number;
	NOMBRE_LINEA_TRABAJO: string;
	AUMENTA_DISMINUYE: number;
	ESTADO_LINEA: boolean;
	NOMBRE_AUMENTA_DISMINUYE?: string;
	USUARIO_CREA?: string;
	FECHA_CREA?: Date;
	ESTACION_CREA?: string;
	USUARIO_ACTU?: string;
	FECHA_ACTU?: Date;
	ESTACION_ACTU?: string;
}
