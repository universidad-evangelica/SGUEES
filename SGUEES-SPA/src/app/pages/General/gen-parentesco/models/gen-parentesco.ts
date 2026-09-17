// Qué hace: modelo TypeScript de parentesco.
// Cómo lo hace: define campos de formulario/grilla y auditoría.
export interface GenParentesco {
	CORR_PARENTESCO: number;
	NOMBRE_PARENTESCO: string;
	DESCRIPCION: string;
	ACTIVO_PARENTESCO: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
