export interface ConPartidaBitacora {
	CORR_EMPRESA: number;
	CORR_PARTIDA_BITACORA: number;
	ANIO_PERIODO: number;
	MES_PERIODO: number;
	CORR_CLASE_PARTIDA: number;
	CORR_PARTIDA: number;
	TIPO_EVENTO: string;
	FECHA_EVENTO: Date | string;
	ESTADO_ANTERIOR: string;
	NOMBRE_ESTADO_ANTERIOR: string;
	ESTADO_NUEVO: string;
	NOMBRE_ESTADO_NUEVO: string;
	OBSERVACION: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
}
