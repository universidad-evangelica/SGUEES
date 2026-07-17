// Modelo del catálogo de nivel académico usado en la vista Payroll.
export interface PlaNivelAcademico {
	CORR_EMPRESA: number; // Empresa dueña del registro
	CORR_NIVEL_ACADEMICO: number; // PK del nivel académico
	NOMBRE_NIVEL_ACADEMICO: string;
	ESTADO_NIVEL_ACADEMICO: boolean; // true=activo, false=inactivo
	USUARIO_CREA: string;
	FECHA_CREA: Date;
	ESTACION_CREA: string;
	USUARIO_ACTU: string;
	FECHA_ACTU: Date;
	ESTACION_ACTU: string;
}
