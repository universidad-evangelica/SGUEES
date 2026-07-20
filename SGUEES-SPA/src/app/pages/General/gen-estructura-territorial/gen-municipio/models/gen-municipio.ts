// Qué hace: define la estructura de un municipio en Angular (GEN_MUNICIPIO).
export interface GenMunicipio {
	CORR_DEPTO: number;
	CORR_MUNICIPIO: number;
	CORR_PAIS: number;
	NOMBRE_MUNICIPIO: string;
	CODIGO_MUNICIPIO: string;
	NOMBRE_DEPTO?: string;
	NOMBRE_PAIS?: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
