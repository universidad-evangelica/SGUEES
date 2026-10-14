// Qué hace: modelo de idioma de persona (tab Formación).
// Cómo lo hace: refleja V_GEN_PERSONA_IDIOMAS para gen-empleado.
export interface GenPersonaIdioma {
	CORR_EMPRESA: number;
	CORR_PERSONA: number;
	CORR_IDIOMA: number;
	NOMBRE_IDIOMA: string;
	NIVEL_DOMINIO?: string;
}
