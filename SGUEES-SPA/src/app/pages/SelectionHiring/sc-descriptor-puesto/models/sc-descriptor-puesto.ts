export interface ScDescriptorPuesto {
	CORR_EMPRESA: number;
	CORR_DESCRIPTOR_PUESTO: number;
	CORR_PUESTO: number | null;
	CORR_UNIDAD: number | null;
	FECHA_EMISION: Date | string | null;
	CORR_PUESTO_REPORTA: number | null;
	FECHA_REVISION: Date | string | null;
	NUM_PERSONAL_CARGO: number | null;
	OBJETIVO_PUESTO: string;
	CORR_IMPACTO_ECONOMICO: number | null;
	CORR_INDUCCION: number | null;
	RESPONSABLE: string;
	FORMATO: string;
	VERSION: number | null;
	ESTADO_DESCRIPTOR: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date | string | null;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date | string | null;
	NOMBRE_PUESTO?: string;
	NOMBRE_UNIDAD?: string;
}

export interface MockUnidad {
	CORR_UNIDAD: number;
	NOMBRE_UNIDAD: string;
}

export interface MockPuesto {
	CORR_PUESTO: number;
	CORR_UNIDAD: number;
	NOMBRE_PUESTO: string;
	CORR_PUESTO_REPORTA: number;
	RESPONSABLE: string;
}

export interface MockPuestoReporta {
	CORR_PUESTO_REPORTA: number;
	NOMBRE_PUESTO_REPORTA: string;
}

export interface ScCompetenciaTecnicaLookupItem {
	CORR_COMPETENCIAS_TECNICAS: number;
	CORR_COMPETENCIAS_TECNICAS_PADRE: number | null;
	CODIGO_COMPETENCIAS_TECNICAS: string;
	NOMBRE_COMPETENCIAS_TECNICAS: string;
	DESCRIPCION: string;
	NOMBRE_DISPLAY: string;
	GRUPO_PADRE: string;
	NIVEL: string;
}
