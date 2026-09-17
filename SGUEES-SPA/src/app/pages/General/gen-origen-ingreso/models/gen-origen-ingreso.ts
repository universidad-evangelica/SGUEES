// Qué hace: modelo TypeScript de origen ingreso.
// Cómo lo hace: define campos de formulario/grilla y auditoría.
export interface GenOrigenIngreso {
	CORR_ORIGEN_INGRESO: number;
	NOMBRE_ORIGEN_INGRESO: string;
	ACTIVO_ORIGEN_INGRESO: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
