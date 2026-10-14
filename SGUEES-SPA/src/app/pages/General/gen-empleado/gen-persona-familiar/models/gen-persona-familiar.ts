// Qué hace: modelo de familiar de persona (tab Familiares).
// Cómo lo hace: refleja V_GEN_PERSONA_FAMILIAR + parentesco para gen-empleado.
export interface GenPersonaFamiliar {
	CORR_EMPRESA: number;
	CORR_PERSONA: number;
	CORR_FAMILIAR: number;
	NOMBRE_COMPLETO: string;
	CORR_PARENTESCO: number | null;
	NOMBRE_PARENTESCO?: string;
	TELEFONO?: string;
	DOMICILIO?: string;
	OCUPACION?: string;
	FECHA_NACIMIENTO?: Date | string | null;
}
