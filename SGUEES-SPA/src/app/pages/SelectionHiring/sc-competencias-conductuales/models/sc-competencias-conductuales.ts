// Qué hace: modelo TypeScript de competencia conductual.
// Cómo: define los campos del formulario y la grilla, incluidos los de auditoría.
export interface ScCompetenciasConductuales {
	CORR_EMPRESA: number;
	CORR_COMPETENCIAS_CONDUCTUALES: number;
	CORR_TIPO_PUESTO: number | null;
	NOMBRE_COMPETENCIAS_CONDUCTUALES: string;
	DESCRIPCION: string;
	// Indica si la competencia conductual está activa (true) o inactiva (false).
	ESTADO_COMPETENCIAS_CONDUCTUALES: boolean;
	NOMBRE_TIPO_PUESTO?: string;
	USUARIO_CREA: string;
	FECHA_CREA: Date;
	ESTACION_CREA: string;
	USUARIO_ACTU: string;
	FECHA_ACTU: Date;
	ESTACION_ACTU: string;
}
