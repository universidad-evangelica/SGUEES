// Qué hace: modelo de fila del catálogo Seguro Social (V_PLA_SEGURO_SOCIAL).
// Cómo lo hace: refleja PK, datos, Activo y auditoría.
export class PlaSeguroSocial {
	CORR_SEGURO_SOCIAL: number;
	NOMBRE_SEGURO_SOCIAL: string;
	NOMBRE_CORTO_SEGURO: string;
	ACTIVO_SEGURO_SOCIAL: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date | string | null;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date | string | null;
}
