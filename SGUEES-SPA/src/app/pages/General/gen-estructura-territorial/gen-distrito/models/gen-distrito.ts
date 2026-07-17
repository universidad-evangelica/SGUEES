// Modelo de distrito (GEN_DISTRITO) dentro de la cascada territorial.
export interface GenDistrito {
	CORR_PAIS: number;
	CORR_DEPTO: number;
	CORR_MUNICIPIO: number;
	CORR_DISTRITO: number;
	NOMBRE_DISTRITO: string;
	NOMBRE_MUNICIPIO?: string;
	NOMBRE_DEPTO?: string;
	NOMBRE_PAIS?: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
