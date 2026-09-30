// Qué hace: modelo de formación académica de persona (tab Formación).
// Cómo lo hace: refleja V_GEN_PERSONA_FORMACION_ACADEMICA para gen-empleado.
export interface GenPersonaFormacionAcademica {
	CORR_EMPRESA: number;
	CORR_PERSONA: number;
	CORR_FORMACION_ACADEMICA: number;
	TITULO?: string;
	CENTRO_EDUCATIVO?: string;
	NIVEL?: string;
	DESDE?: Date | string | null;
	HASTA?: Date | string | null;
	PERIODO_INICIAL?: number | null;
	PERIODO_FINAL?: number | null;
	PERIODO?: string;
}
