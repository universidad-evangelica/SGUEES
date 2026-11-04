// Qué hace: modelo TypeScript del documento de admisión.
// Cómo lo hace: define campos de formulario, grilla y auditoría.
export interface AcaDocumentoAdmision {
	CORR_DOCUMENTO_ADMISION: number;
	NOMBRE_DOCUMENTO: string;
	CODIGO: string;
	OBLIGATORIO: boolean;
	ORDEN: number;
	ACTIVO: boolean;
	FORMATOS_PERMITIDOS: string;
	TAMANO_MAXIMO_MB: number;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
