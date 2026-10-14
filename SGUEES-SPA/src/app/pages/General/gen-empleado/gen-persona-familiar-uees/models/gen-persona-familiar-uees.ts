// Qué hace: modelo de familiar que trabaja en UEES (tab Adicional).
// Cómo lo hace: refleja V_GEN_PERSONA_FAMILIAR_UEES + parentesco para gen-empleado.
export interface GenPersonaFamiliarUees {
	CORR_EMPRESA: number;
	CORR_PERSONA: number;
	CORR_FAMILIAR_UEES: number;
	NOMBRE_COMPLETO: string;
	CORR_PARENTESCO: number | null;
	NOMBRE_PARENTESCO?: string;
	TELEFONO?: string;
	CARGO?: string;
	LUGAR_TRABAJO?: string;
}
