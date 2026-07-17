// Modelo de departamento (GEN_DEPTO) dentro de la cascada territorial.
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
