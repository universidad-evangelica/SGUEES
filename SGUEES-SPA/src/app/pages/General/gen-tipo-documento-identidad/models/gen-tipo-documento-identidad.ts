// Qué hace: modelo TypeScript de tipo documento identidad.
// Cómo lo hace: define campos de formulario/grilla, listas y auditoría.
export interface GenTipoDocumentoIdentidad {
	CORR_TIPO_DOCUMENTO_IDENTIDAD: number;
	NOMBRE_TIPO_DOCUMENTO_IDENTIDAD: string;
	NOMBRE_CORTO: string;
	ACTIVO_TIPO_DOCUMENTO_IDENTIDAD: boolean;
	NUMERO_CARACTERES: number;
	ACTIVO_CARACTERES: boolean;
	FORMATO_CARACTERES: string;
	NOMBRE_FORMATO_CARACTERES?: string;
	APLICA_PARA: string;
	NOMBRE_APLICA_PARA?: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
