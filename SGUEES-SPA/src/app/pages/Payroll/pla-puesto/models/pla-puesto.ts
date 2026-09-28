// Qué hace: modelo TypeScript de puesto (PLA_PUESTO).
// Cómo: campos vigentes del catálogo: código, nombre, tipo, activo, aprobación, misión y auditoría.
export interface PlaPuesto {
	CORR_EMPRESA: number;
	CORR_PUESTO: number;
	CODIGO_PUESTO: string;
	NOMBRE_PUESTO: string;
	CORR_TIPO_PUESTO: number | null;
	NOMBRE_TIPO_PUESTO?: string | null;
	ACTIVO_PUESTO: boolean;
	APROBACION_PUESTO: boolean;
	MISION_PUESTO: string;
	OTROS_ASPECTOS: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
