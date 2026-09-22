// Qué hace: modelo de referencia laboral (tab Referencias).
// Cómo lo hace: refleja V_GEN_PERSONA_REFERENCIA_LABORAL para gen-empleado.
export interface GenPersonaReferenciaLaboral {
	CORR_EMPRESA: number;
	CORR_PERSONA: number;
	CORR_REFERENCIA_LABORAL: number;
	NOMBRE_COMPLETO: string;
	LUGAR_TRABAJO?: string;
	TELEFONO?: string;
}
