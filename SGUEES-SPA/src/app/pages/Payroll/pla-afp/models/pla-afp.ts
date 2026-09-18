// Qué hace: modelo de fila del catálogo AFP (V_PLA_AFP).
// Cómo lo hace: refleja PK, datos, Activo y auditoría.
export interface PlaAfp {
	CORR_AFP: number;
	NOMBRE_AFP: string;
	NOMBRE_CORTO_AFP: string;
	CODIGO_SGVPP: string;
	INCLUYE_SEPP: boolean;
	ACTIVO_AFP: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date | string | null;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date | string | null;
}
