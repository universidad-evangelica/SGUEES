// Qué hace: modelo de hijo de persona (tab Familiares).
// Cómo lo hace: refleja V_GEN_PERSONA_HIJOS para gen-empleado.
export interface GenPersonaHijo {
	CORR_EMPRESA: number;
	CORR_PERSONA: number;
	CORR_HIJO: number;
	NOMBRE_COMPLETO: string;
	EDAD?: number | null;
	SEXO?: string;
	FECHA_NACIMIENTO?: Date | string | null;
}
