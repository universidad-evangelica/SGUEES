// Qué hace: modelo de una sede asignada a una facultad (ACA_FACULTADES_SEDES / V_ACA_FACULTADES_SEDES).
// Cómo lo hace: la llave es CORR_FACULTAD + CORR_SEDE; CODIGO_SEDE y NOMBRE_SEDE vienen de la vista.
export interface AcaFacultadesSedes {
	CORR_FACULTAD: number;
	CORR_SEDE: number | null;
	CODIGO_SEDE?: string;
	NOMBRE_SEDE?: string;
	ACTIVO: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
