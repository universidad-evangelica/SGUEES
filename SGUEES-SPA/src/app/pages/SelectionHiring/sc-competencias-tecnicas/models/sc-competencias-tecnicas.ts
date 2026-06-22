export const SC_COMPETENCIA_NIVEL = {
	UNO: 'NIV1',
	DOS: 'NIV2',
	TRES: 'NIV3',
} as const;

export interface ScCompetenciasTecnicas {
	CORR_EMPRESA: number;
	CORR_COMPETENCIAS_TECNICAS: number;
	CORR_COMPETENCIAS_TECNICAS_PADRE?: number | null;
	CODIGO_COMPETENCIAS_TECNICAS: string;
	NOMBRE_COMPETENCIAS_TECNICAS?: string | null;
	DESCRIPCION: string;
	NIVEL: string;
	ESTADO_COMPETENCIAS_TECNICAS: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
	CODIGO_PADRE?: string;
	NOMBRE_PADRE?: string;
	DESCRIPCION_PADRE?: string;
	CODIGO_PREFIJO?: string;
	CODIGO_SUFIJO?: string;
}

export interface ScCompetenciaPadreOption {
	CORR_COMPETENCIAS_TECNICAS: number;
	CODIGO_COMPETENCIAS_TECNICAS: string;
	NOMBRE_COMPETENCIAS_TECNICAS?: string;
	DESCRIPCION?: string;
	NIVEL?: string;
	ESTADO_COMPETENCIAS_TECNICAS?: boolean;
}
