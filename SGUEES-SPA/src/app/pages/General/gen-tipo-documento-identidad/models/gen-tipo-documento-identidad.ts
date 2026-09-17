// Qué hace: modelo TypeScript de tipo documento identidad.
// Cómo lo hace: define campos de formulario/grilla y auditoría.
export interface GenTipoDocumentoIdentidad {
	CORR_TIPO_DOCUMENTO_IDENTIDAD: number;
	NOMBRE_TIPO_DOCUMENTO_IDENTIDAD: string;
	NOMBRE_CORTO: string;
	ACTIVO_TIPO_DOCUMENTO_IDENTIDAD: boolean;
	NUMERO_CARACTERES: number;
	ACTIVO_CARACTERES: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
