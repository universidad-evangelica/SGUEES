// Qué hace: modelo de contacto por persona (tab Contactos).
// Cómo lo hace: catálogo (formato/aplica) + VALOR_CONTACTO editable en gen-empleado.
export interface GenPersonaContacto {
	CORR_EMPRESA: number;
	CORR_PERSONA: number;
	CORR_CONTACTO: number;
	CORR_TIPO_CONTACTO: number;
	NOMBRE_TIPO_CONTACTO: string;
	NOMBRE_CORTO: string;
	NUMERO_CARACTERES: number;
	ACTIVO_CARACTERES: boolean;
	FORMATO_CARACTERES?: string;
	APLICA_PARA?: string;
	ACTIVO_TIPO_CONTACTO: boolean;
	ACTIVO_CONTACTO: boolean;
	VALOR_CONTACTO: string;
	EXISTE: boolean;
}
