export interface ConPartidaModeloSeleccion {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	MES_PERIODO: number;
	CORR_CLASE_PARTIDA: number;
	NOMBRE_CLASE_PARTIDA: string;
	CORR_PARTIDA: number;
	FECHA_PARTIDA: Date;
	NOMBRE_PARTIDA: string;
	NOMBRE_ESTADO_PARTIDA: string;
}

export interface ConPartidaModeloGeneracion {
	ANIO_PERIODO: number;
	MES_PERIODO: number;
	FECHA_PARTIDA: Date;
	CORR_CLASE_PARTIDA: number;
	NOMBRE_CLASE_PARTIDA: string;
	CORR_PARTIDA: number;
	CORR_PARTIDA_GENERADA?: number;
}
