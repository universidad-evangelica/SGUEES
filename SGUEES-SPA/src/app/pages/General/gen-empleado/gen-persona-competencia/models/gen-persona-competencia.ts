// Qué hace: modelo de competencia de persona (tab Formación).
// Cómo lo hace: refleja V_GEN_PERSONA_COMPETENCIA para gen-empleado.
export interface GenPersonaCompetencia {
	CORR_EMPRESA: number;
	CORR_PERSONA: number;
	CORR_COMPETENCIA: number;
	NOMBRE_COMPETENCIA: string;
	NIVEL_DOMINIO?: string;
}
