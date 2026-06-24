export interface ConPartida {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	MES_PERIODO: number;
	CORR_CLASE_PARTIDA: number;
	NOMBRE_CLASE_PARTIDA: string;
	CORR_PARTIDA: number;
	FECHA_PARTIDA: Date;
	NUMERO_DOCUMENTO: string;
	NOMBRE_PARTIDA: string;
	ESTADO_PARTIDA: string;
	CLASE_PARTIDA: string;
	CORR_MONEDA: number;
	FACTOR_CAMBIO: number;
	OPERADOR: string;
	USUARIO_CREA: string;
	FECHA_CREA: Date;
	ESTACION_CREA: string;
}
