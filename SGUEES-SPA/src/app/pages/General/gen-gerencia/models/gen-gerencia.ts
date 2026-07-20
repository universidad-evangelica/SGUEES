// Qué hace: define la estructura de datos de una gerencia en Angular (GEN_GERENCIA).
export interface GenGerencia {
	CORR_EMPRESA: number;
	CORR_GERENCIA: number;
	NOMBRE_GERENCIA: string;
	CODIGO_GERENCIA: string;
	CORR_DIVISION?: number | null;
	NOMBRE_DIVISION?: string;
	CODIGO_DIVISION?: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
