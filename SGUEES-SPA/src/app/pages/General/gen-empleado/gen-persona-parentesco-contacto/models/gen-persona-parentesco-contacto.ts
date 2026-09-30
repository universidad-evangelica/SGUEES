// Qué hace: modelo de persona de contacto del empleado (tab Contactos).
// Cómo lo hace: refleja V_GEN_PERSONA_PARENTESCO_CONTACTO para gen-empleado.
export interface GenPersonaParentescoContacto {
	CORR_EMPRESA: number;
	CORR_PERSONA: number;
	CORR_PARENTESCO_CONTACTO: number;
	NOMBRE_COMPLETO: string;
	CORR_PARENTESCO?: number | null;
	NOMBRE_PARENTESCO?: string;
	CORR_TIPO_CONTACTO?: number | null;
	NOMBRE_TIPO_CONTACTO?: string;
	NOMBRE_CORTO?: string;
	NUMERO_CARACTERES?: number;
	ACTIVO_CARACTERES?: boolean | number;
	FORMATO_CARACTERES?: string;
	APLICA_PARA?: string;
	VALOR_CONTACTO?: string;
	DIRECCION?: string;
	ES_EXTRANJERO?: boolean;
	PARENTESCO_CONTACTO_EMERGENCIA?: boolean;
	ACTIVO_PARENTESCO_CONTACTO?: boolean;
}
