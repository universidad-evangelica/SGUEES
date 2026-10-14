// Qué hace: modelo de referencia personal (tab Referencias personales).
// Cómo lo hace: refleja V_GEN_PERSONA_REFERENCIA_PERSONAL para gen-empleado.
export interface GenPersonaReferenciaPersonal {
	CORR_EMPRESA: number;
	CORR_PERSONA: number;
	CORR_REFERENCIA_PERSONAL: number;
	NOMBRE_COMPLETO: string;
	DIRECCION?: string;
	TELEFONO?: string;
}
