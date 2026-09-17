// Qué hace: modelo TypeScript de actividad económica.
// Cómo lo hace: define campos de formulario/grilla y auditoría.
export interface GenActividadEconomica {
	CORR_ACTIVIDAD_ECONOMICA: number;
	CODIGO_ACTIVIDAD_ECONOMICA: string;
	NOMBRE_ACTIVIDAD_ECONOMICA: string;
	ACTIVO_ACTIVIDAD_ECONOMICA: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
