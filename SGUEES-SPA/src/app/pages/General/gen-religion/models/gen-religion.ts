// Qué hace: modelo TypeScript de religión.
// Cómo lo hace: define campos de formulario/grilla y auditoría.
export interface GenReligion {
	CORR_RELIGION: number;
	NOMBRE_RELIGION: string;
	DESCRIPCION: string;
	ACTIVO_RELIGION: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
