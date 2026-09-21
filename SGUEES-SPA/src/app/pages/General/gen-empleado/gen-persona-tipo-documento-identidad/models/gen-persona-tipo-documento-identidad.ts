// Qué hace: modelo de documento de identidad por persona (tab Documentos).
// Cómo lo hace: catálogo + VALOR_DOCUMENTO editable en gen-empleado.
export interface GenPersonaTipoDocumentoIdentidad {
	CORR_EMPRESA: number;
	CORR_PERSONA: number;
	CORR_TIPO_DOCUMENTO_IDENTIDAD: number;
	NOMBRE_TIPO_DOCUMENTO_IDENTIDAD: string;
	NOMBRE_CORTO: string;
	NUMERO_CARACTERES: number;
	ACTIVO_CARACTERES: boolean;
	ACTIVO_TIPO_DOCUMENTO_IDENTIDAD: boolean;
	VALOR_DOCUMENTO: string;
	EXISTE: boolean;
}
