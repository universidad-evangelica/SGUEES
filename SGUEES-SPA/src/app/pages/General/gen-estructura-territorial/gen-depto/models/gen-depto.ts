// Qué hace: define la estructura de un departamento en Angular (GEN_DEPTO).
export interface GenDepto {
	CORR_PAIS: number;
	CORR_DEPTO: number;
	NOMBRE_DEPTO: string;
	CODIGO_DEPTO: string;
	NOMBRE_PAIS?: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
