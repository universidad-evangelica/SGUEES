// Qué hace: modelo de experiencia laboral de persona (tab Experiencia).
// Cómo lo hace: refleja V_GEN_PERSONA_EXPERIENCIA_LABORAL para gen-empleado.
export interface GenPersonaExperienciaLaboral {
	CORR_EMPRESA: number;
	CORR_PERSONA: number;
	CORR_EXPERIENCIA_LABORAL: number;
	LUGAR_TRABAJO: string;
	CARGO_DESEMPENADO?: string;
	TELEFONO?: string;
	JEFE_INMEDIATO?: string;
	SALARIO_INICIAL?: number | null;
	SALARIO_FINAL?: number | null;
	FECHA_INICIO?: Date | string | null;
	FECHA_FIN?: Date | string | null;
	PERIODO_INICIAL?: number | null;
	PERIODO_FINAL?: number | null;
	PERIODO?: string;
	MOTIVO_SALIDA?: string;
}
